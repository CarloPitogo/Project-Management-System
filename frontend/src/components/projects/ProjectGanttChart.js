import React from 'react';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';

const ProjectGanttChart = ({ tasks }) => {
  if (!Array.isArray(tasks)) {
    console.warn('Tasks prop is not an array');
    return <div className="alert alert-warning">No valid tasks to display</div>;
  }

  const ganttTasks = tasks.reduce((acc, task) => {
    if (!task || !task.start_time || !task.due_time) return acc;

    const startDate = new Date(task.start_time);
    const endDate = new Date(task.due_time);

    if (isNaN(startDate) || isNaN(endDate)) return acc;

    acc.push({
      start: startDate,
      end: endDate,
      name: task.title || 'Untitled Task',
      id: task.id ? task.id.toString() : Math.random().toString(36).substr(2, 9),
      type: 'task',
      progress: task.status === 'completed' ? 100 : 0,
      isDisabled: true,
    });

    return acc;
  }, []);

  if (ganttTasks.length === 0) {
    return <div className="alert alert-warning">No valid tasks to display</div>;
  }

  return (
    <div style={{ backgroundColor: '#f7efe5', padding: '2rem' }}>
      <div
        className="card shadow-sm"
        style={{ backgroundColor: '#fffaf3', padding: '1.5rem' }}
      >
        <h5 className="mb-4 fw-bold text-dark">📅 Gantt Chart</h5>
        <Gantt
          tasks={ganttTasks}
          viewMode={ViewMode.Day}
          locale="en"
          listCellWidth="155px"
        />
      </div>
    </div>
  );
};

export default ProjectGanttChart;
