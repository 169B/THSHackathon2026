import { Client, Account, Databases, ID, Query } from "appwrite";

const client = new Client()
  .setEndpoint("https://nyc.cloud.appwrite.io/v1")
  .setProject("69bd4b5a00212be16c71");

const account = new Account(client);
const databases = new Databases(client);

const DATABASE_ID = '69bdf6a40036b8e0475e';
const PROFILES_COLLECTION_ID = 'profiles';
const TASKS_COLLECTION_ID = 'tasks';
const PREDICTIONS_COLLECTION_ID = 'predictions';

// ──────────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────────

export async function signup(email, password, name = '') {
  const user = await account.create(ID.unique(), email, password, name || undefined);
  await account.createEmailPasswordSession(email, password);
  await databases.createDocument(DATABASE_ID, PROFILES_COLLECTION_ID, ID.unique(), {
    userId: user.$id,
    name: name || '',
    email: email,
  });
  return user;
}

export async function login(email, password) {
  return await account.createEmailPasswordSession(email, password);
}

export async function logout() {
  return await account.deleteSession('current');
}

export async function getCurrentUser() {
  return await account.get();
}

export async function getUserProfile() {
  const user = await account.get();
  const result = await databases.listDocuments(DATABASE_ID, PROFILES_COLLECTION_ID, [
    Query.equal('userId', user.$id),
  ]);
  return result.documents[0] || null;
}

export async function updateUserProfile(data) {
  const profile = await getUserProfile();
  if (!profile) throw new Error('Profile not found');
  return await databases.updateDocument(DATABASE_ID, PROFILES_COLLECTION_ID, profile.$id, data);
}

// ──────────────────────────────────────────────
// TASKS (writing or problem type)
// ──────────────────────────────────────────────

export async function addTask({
  title,
  description = '',
  class_type = 'math',
  task_type = 'problem',    // 'writing' or 'problem'
  difficulty = 3,           // 1-5
  complexity = 3,           // 1-5 (same scale)
  motivation = 50,          // 0-100
  estimated_length = 60,    // user estimate in minutes
  set_size = 0,             // for problem tasks: number of problems
  status = 'pending',       // pending | in-progress | done
  actual_time = 0,          // filled in post-task
  post_motivation = 0,      // filled in post-task reflection
}) {
  const user = await account.get();
  return await databases.createDocument(DATABASE_ID, TASKS_COLLECTION_ID, ID.unique(), {
    userId: user.$id,
    title,
    description,
    class_type,
    task_type,
    difficulty,
    complexity,
    motivation,
    estimated_length,
    set_size,
    status,
    actual_time,
    post_motivation,
  });
}

export async function getTasks() {
  const user = await account.get();
  const result = await databases.listDocuments(DATABASE_ID, TASKS_COLLECTION_ID, [
    Query.equal('userId', user.$id),
    Query.orderDesc('$createdAt'),
  ]);
  return result.documents;
}

export async function getCompletedTasks() {
  const user = await account.get();
  const result = await databases.listDocuments(DATABASE_ID, TASKS_COLLECTION_ID, [
    Query.equal('userId', user.$id),
    Query.equal('status', 'done'),
  ]);
  return result.documents;
}

export async function updateTask(taskId, data) {
  return await databases.updateDocument(DATABASE_ID, TASKS_COLLECTION_ID, taskId, data);
}

export async function deleteTask(taskId) {
  return await databases.deleteDocument(DATABASE_ID, TASKS_COLLECTION_ID, taskId);
}

// ──────────────────────────────────────────────
// PREDICTIONS
// ──────────────────────────────────────────────

export async function savePrediction(taskId, prediction) {
  const user = await account.get();
  return await databases.createDocument(DATABASE_ID, PREDICTIONS_COLLECTION_ID, ID.unique(), {
    userId: user.$id,
    taskId,
    predicted_minutes: prediction.predicted_minutes,
    confidence: prediction.confidence,
    buffer_percent: prediction.buffer_percent,
    daily_blocks: JSON.stringify(prediction.daily_blocks || []),
  });
}

export async function getPrediction(taskId) {
  const user = await account.get();
  const result = await databases.listDocuments(DATABASE_ID, PREDICTIONS_COLLECTION_ID, [
    Query.equal('userId', user.$id),
    Query.equal('taskId', taskId),
  ]);
  return result.documents[0] || null;
}

// ──────────────────────────────────────────────
// PREDICTION ENGINE
// ──────────────────────────────────────────────

// Personal speed ratio: how fast is this student vs the "average" estimate?
// ratio < 1 = faster than average, ratio > 1 = slower than average
function computeSpeedRatio(completedTasks) {
  const valid = completedTasks.filter(t => t.actual_time > 0 && t.estimated_length > 0);
  if (valid.length === 0) return 1.0;
  const ratios = valid.map(t => t.actual_time / t.estimated_length);
  return ratios.reduce((a, b) => a + b, 0) / ratios.length;
}

// Per-class speed ratio
function computeClassSpeedRatio(completedTasks, classType) {
  const classTasks = completedTasks.filter(t => t.class_type === classType);
  return computeSpeedRatio(classTasks);
}

// Per-task-type speed ratio
function computeTypeSpeedRatio(completedTasks, taskType) {
  const typeTasks = completedTasks.filter(t => t.task_type === taskType);
  return computeSpeedRatio(typeTasks);
}

// Per-difficulty speed ratio (group by similar difficulty ±1)
function computeDifficultySpeedRatio(completedTasks, difficulty) {
  const similar = completedTasks.filter(t => Math.abs(t.difficulty - difficulty) <= 1);
  return computeSpeedRatio(similar);
}

// Determine adaptive buffer based on user history accuracy
function computeBuffer(completedTasks) {
  if (completedTasks.length === 0) return 40;
  if (completedTasks.length < 5) return 20;
  const accurate = completedTasks
    .filter(t => t.actual_time > 0 && t.estimated_length > 0)
    .filter(t => Math.abs(t.actual_time - t.estimated_length) / t.estimated_length <= 0.15);
  const accuracy = accurate.length / completedTasks.length;
  if (accuracy > 0.6) return 10;
  return 20;
}

// Confidence scoring based on data volume
function computeConfidence(completedTasks, classType) {
  const classTasks = completedTasks.filter(t => t.class_type === classType);
  const total = completedTasks.length;
  const classCount = classTasks.length;
  if (total >= 20 && classCount >= 5) return 'high';
  if (total >= 5 || classCount >= 2) return 'medium';
  return 'low';
}

// Generate daily time blocks until a due date
function generateTimeBlocks(totalMinutes, daysUntilDue) {
  if (daysUntilDue <= 0) daysUntilDue = 1;
  const perDay = Math.ceil(totalMinutes / daysUntilDue);
  const blocks = [];
  let remaining = totalMinutes;
  for (let i = 0; i < daysUntilDue; i++) {
    const block = Math.min(perDay, remaining);
    if (block <= 0) break;
    const date = new Date();
    date.setDate(date.getDate() + i);
    blocks.push({
      date: date.toISOString().split('T')[0],
      minutes: block,
    });
    remaining -= block;
  }
  return blocks;
}

// Main prediction function
export async function predictTask(task, daysUntilDue = 7) {
  const completedTasks = await getCompletedTasks();

  // Speed ratios: student vs average person
  const overallRatio = computeSpeedRatio(completedTasks);
  const classRatio = computeClassSpeedRatio(completedTasks, task.class_type);
  const typeRatio = computeTypeSpeedRatio(completedTasks, task.task_type);
  const diffRatio = computeDifficultySpeedRatio(completedTasks, task.difficulty);

  // Weighted speed ratio — prefer class-specific if enough data
  const classCount = completedTasks.filter(t => t.class_type === task.class_type).length;
  const typeCount = completedTasks.filter(t => t.task_type === task.task_type).length;
  let speedRatio;
  if (classCount >= 3 && typeCount >= 2) {
    speedRatio = 0.4 * classRatio + 0.3 * typeRatio + 0.2 * diffRatio + 0.1 * overallRatio;
  } else if (classCount >= 2) {
    speedRatio = 0.5 * classRatio + 0.3 * overallRatio + 0.2 * diffRatio;
  } else {
    speedRatio = overallRatio;
  }

  // Base time = "average person" estimate (estimated_length from rubric/AI)
  let avgPersonMinutes = task.estimated_length || 60;

  // For problem sets, use historical per-problem time if available
  if (task.task_type === 'problem' && task.set_size > 0) {
    const problemTasks = completedTasks.filter(t => t.task_type === 'problem' && t.set_size > 0 && t.actual_time > 0);
    if (problemTasks.length > 0) {
      const avgPerProblem = problemTasks.reduce((sum, t) => sum + t.actual_time / t.set_size, 0) / problemTasks.length;
      avgPersonMinutes = task.set_size * avgPerProblem;
    }
  }

  // Motivation adjustment (low motivation = takes longer)
  const motivationFactor = 1 + ((50 - (task.motivation || 50)) / 100);

  // Predicted = average_person_time × student_speed_ratio × motivation_factor
  let predicted = avgPersonMinutes * speedRatio * motivationFactor;

  // Buffer
  const bufferPercent = computeBuffer(completedTasks);
  predicted = predicted * (1 + bufferPercent / 100);
  predicted = Math.round(predicted);

  // Confidence
  const confidence = computeConfidence(completedTasks, task.class_type);

  // Time blocks
  const daily_blocks = generateTimeBlocks(predicted, daysUntilDue);

  return {
    predicted_minutes: predicted,
    avg_person_minutes: avgPersonMinutes,
    speed_ratio: Math.round(speedRatio * 100) / 100,
    confidence,
    buffer_percent: bufferPercent,
    daily_blocks,
  };
}

export { client, account, databases, ID, DATABASE_ID, PROFILES_COLLECTION_ID, TASKS_COLLECTION_ID, PREDICTIONS_COLLECTION_ID };
