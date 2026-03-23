// Canvas LMS API utilities
const DEFAULT_CANVAS_API_BASE = process.env.NEXT_PUBLIC_CANVAS_API_URL || 'https://canvas.instructure.com/api/v1';

/**
 * Initialize Canvas OAuth flow
 * Redirects user to Canvas authorization endpoint
 */
export const initiateCanvasOAuth = () => {
  const clientId = process.env.NEXT_PUBLIC_CANVAS_OAUTH_CLIENT_ID;
  const redirectUri = `${window.location.origin}/api/canvas/callback`;
  const scope = 'url:GET|/api/v1/courses url:GET|/api/v1/courses/:id/assignments';
  
  const authUrl = `https://canvas.instructure.com/login/oauth2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
  window.location.href = authUrl;
};

/**
 * Fetch user's Canvas courses
 */
export const fetchCanvasCourses = async (token, baseUrl = DEFAULT_CANVAS_API_BASE) => {
  try {
    const response = await fetch(`${baseUrl}/courses?enrollment_state=active`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) throw new Error('Failed to fetch courses');
    return await response.json();
  } catch (error) {
    console.error('Error fetching Canvas courses:', error);
    throw error;
  }
};

/**
 * Fetch assignments for a specific course
 */
export const fetchCourseAssignments = async (token, courseId, baseUrl = DEFAULT_CANVAS_API_BASE) => {
  try {
    const response = await fetch(`${baseUrl}/courses/${courseId}/assignments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) throw new Error('Failed to fetch assignments');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching assignments for course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Get assignments due in the next 7 days
 */
export const getUpcomingAssignments = async (token, baseUrl = DEFAULT_CANVAS_API_BASE) => {
  try {
    const courses = await fetchCanvasCourses(token, baseUrl);
    const allAssignments = [];
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Fetch assignments from all courses
    for (const course of courses) {
      try {
        const assignments = await fetchCourseAssignments(token, course.id, baseUrl);
        
        // Filter for assignments due in next 7 days
        const upcoming = assignments.filter(assignment => {
          if (!assignment.due_at) return false;
          const dueDate = new Date(assignment.due_at);
          return dueDate >= now && dueDate <= sevenDaysFromNow;
        });

        allAssignments.push(
          ...upcoming.map(assignment => ({
            ...assignment,
            course_name: course.name,
            course_id: course.id,
            source: 'canvas',
          }))
        );
      } catch (err) {
        console.error(`Error fetching assignments for course ${course.id}:`, err);
      }
    }

    // Sort by due date
    return allAssignments.sort((a, b) => new Date(a.due_at) - new Date(b.due_at));
  } catch (error) {
    console.error('Error getting upcoming assignments:', error);
    throw error;
  }
};

/**
 * Convert Canvas assignment to Estimately task format
 */
export const convertCanvasToTask = (assignment, userId) => {
  const description = assignment.description ? 
    assignment.description.replace(/<[^>]*>/g, '') : // Strip HTML tags
    'Canvas assignment';

  return {
    title: assignment.name,
    description: description,
    class_type: 'other', // Can be mapped based on course code
    task_type: 'problem',
    difficulty: 3, // Default, can be refined by user
    complexity: 3, // Default, can be refined by user
    motivation: 50, // Default
    estimated_length: 60, // Default, will use AI prediction
    set_size: 1,
    status: 'pending',
    userId: userId,
    canvas_assignment_id: String(assignment.id),
    canvas_course_name: assignment.course_name,
    canvas_course_id: assignment.course_id,
    canvas_due_date: assignment.due_at,
    canvas_html_url: assignment.html_url,
  };
};
