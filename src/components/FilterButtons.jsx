import React from 'react'

const FILTER_TYPES = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed'
}

const FilterButtons = ({ filter, setFilter, activeTasksCount, completedTasksCount, onClearCompleted }) => {
  const filters = [
    { key: FILTER_TYPES.ALL, label: 'All', count: activeTasksCount + completedTasksCount },
    { key: FILTER_TYPES.ACTIVE, label: 'Active', count: activeTasksCount },
    { key: FILTER_TYPES.COMPLETED, label: 'Completed', count: completedTasksCount }
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex flex-wrap gap-2">
        {filters.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === key
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {label}
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white/20 dark:bg-black/20">
              {count}
            </span>
          </button>
        ))}
      </div>
      
      {completedTasksCount > 0 && (
        <button
          onClick={onClearCompleted}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Clear Completed ({completedTasksCount})
        </button>
      )}
    </div>
  )
}

export default FilterButtons
