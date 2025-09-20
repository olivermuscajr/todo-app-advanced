import React, { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { format, parseISO, isValid } from 'date-fns'
import ThemeToggle from './ThemeToggle'
import TaskItem from './TaskItem'
import FilterButtons from './FilterButtons'
import SearchBar from './SearchBar'
import AddTaskForm from './AddTaskForm'

const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
}

const FILTER_TYPES = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed'
}

const TodoApp = () => {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState(FILTER_TYPES.ALL)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('todo-tasks')
    const savedTheme = localStorage.getItem('todo-theme')
    const savedFilter = localStorage.getItem('todo-filter')
    
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks))
      } catch (error) {
        console.error('Error parsing saved tasks:', error)
      }
    }
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
    }
    
    if (savedFilter) {
      setFilter(savedFilter)
    }
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks))
  }, [tasks])

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('todo-theme', isDarkMode ? 'dark' : 'light')
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Save filter to localStorage
  useEffect(() => {
    localStorage.setItem('todo-filter', filter)
  }, [filter])

  const addTask = (text, priority = PRIORITY_LEVELS.MEDIUM, dueDate = null) => {
    if (text.trim()) {
      const newTask = {
        id: Date.now().toString(),
        text: text.trim(),
        completed: false,
        priority,
        dueDate: dueDate ? dueDate.toISOString() : null,
        createdAt: new Date().toISOString()
      }
      setTasks(prev => [newTask, ...prev])
    }
  }

  const toggleTask = (id) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const editTask = (id, newText, newPriority, newDueDate) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { 
        ...task, 
        text: newText.trim(),
        priority: newPriority,
        dueDate: newDueDate ? newDueDate.toISOString() : null
      } : task
    ))
    setEditingId(null)
  }

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id))
  }

  const clearCompleted = () => {
    setTasks(prev => prev.filter(task => !task.completed))
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = 
      filter === FILTER_TYPES.ALL ||
      (filter === FILTER_TYPES.ACTIVE && !task.completed) ||
      (filter === FILTER_TYPES.COMPLETED && task.completed)
    
    const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const activeTasksCount = tasks.filter(task => !task.completed).length
  const completedTasksCount = tasks.filter(task => task.completed).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            Todo List
          </h1>
          <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        </div>

        {/* Add Task Form */}
        <AddTaskForm onAddTask={addTask} />

        {/* Search Bar */}
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {/* Filter Buttons */}
        <FilterButtons 
          filter={filter} 
          setFilter={setFilter}
          activeTasksCount={activeTasksCount}
          completedTasksCount={completedTasksCount}
          onClearCompleted={clearCompleted}
        />

        {/* Task List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={filteredTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
              <div className="min-h-[200px]">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No tasks match your search.' : 'No tasks yet. Add one above!'}
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      isEditing={editingId === task.id}
                      onToggle={toggleTask}
                      onEdit={editTask}
                      onDelete={deleteTask}
                      onStartEdit={() => setEditingId(task.id)}
                      onCancelEdit={() => setEditingId(null)}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Task Counter */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {activeTasksCount} task{activeTasksCount !== 1 ? 's' : ''} left
          {completedTasksCount > 0 && (
            <span className="ml-2">
              • {completedTasksCount} completed
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default TodoApp
