"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Calendar, Briefcase, Code, Clock, LogOut, Palette } from "lucide-react"
import { cn } from "@/lib/utils"

import { useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

type Task = {
  id: string
  title: string
  priority: "high" | "medium" | "low"
  dueDate?: string
  tags: string[]
}

type Category = {
  id: string
  title: string
  color: string
  gradient: string
  icon: any
  tasks: Task[]
  count: number
}

type ViewType = "work-type" | "technology" | "timeline" | "priority"

const colorOptions = [
  { name: "Blue", gradient: "bg-gradient-to-br from-blue-500 to-blue-600", color: "from-blue-500 to-blue-600" },
  {
    name: "Green",
    gradient: "bg-gradient-to-br from-green-500 to-emerald-600",
    color: "from-green-500 to-emerald-600",
  },
  {
    name: "Purple",
    gradient: "bg-gradient-to-br from-purple-500 to-violet-600",
    color: "from-purple-500 to-violet-600",
  },
  { name: "Orange", gradient: "bg-gradient-to-br from-orange-500 to-red-500", color: "from-orange-500 to-red-500" },
  { name: "Pink", gradient: "bg-gradient-to-br from-pink-500 to-rose-600", color: "from-pink-500 to-rose-600" },
  { name: "Cyan", gradient: "bg-gradient-to-br from-cyan-500 to-blue-500", color: "from-cyan-500 to-blue-500" },
  { name: "Teal", gradient: "bg-gradient-to-br from-teal-500 to-green-600", color: "from-teal-500 to-green-600" },
  {
    name: "Indigo",
    gradient: "bg-gradient-to-br from-indigo-500 to-purple-600",
    color: "from-indigo-500 to-purple-600",
  },
]

const iconOptions = [
  { name: "Briefcase", icon: Briefcase },
  { name: "Code", icon: Code },
  { name: "Calendar", icon: Calendar },
  { name: "Clock", icon: Clock },
  { name: "Palette", icon: Palette },
  ]

const initialData: Record<ViewType, Category[]> = {
  "work-type": [
    {
      id: "work",
      title: "Work Projects",
      color: "from-blue-500 to-blue-600",
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      icon: Briefcase,
      count: 5,
      tasks: [
        {
          id: "1",
          title: "Complete quarterly report",
          priority: "high",
          dueDate: "2024-01-15",
          tags: ["urgent", "management"],
        },
        {
          id: "2",
          title: "Review team performance",
          priority: "medium",
          dueDate: "2024-01-20",
          tags: ["hr", "review"],
        },
        { id: "3", title: "Plan Q2 roadmap", priority: "medium", tags: ["planning", "strategy"] },
        { id: "4", title: "Update project documentation", priority: "low", tags: ["docs", "maintenance"] },
        { id: "5", title: "Prepare client presentation", priority: "high", tags: ["client", "presentation"] },
      ],
    },
    {
      id: "learning",
      title: "Learning",
      color: "from-green-500 to-emerald-600",
      gradient: "bg-gradient-to-br from-green-500 to-emerald-600",
      icon: Code,
      count: 3,
      tasks: [
        { id: "6", title: "Complete React course", priority: "medium", tags: ["react", "frontend"] },
        { id: "7", title: 'Read "Clean Code"', priority: "low", tags: ["books", "best-practices"] },
        { id: "8", title: "Practice TypeScript", priority: "medium", tags: ["typescript", "coding"] },
      ],
    },
  ],
  technology: [
    {
      id: "frontend",
      title: "Frontend",
      color: "from-cyan-500 to-blue-500",
      gradient: "bg-gradient-to-br from-cyan-500 to-blue-500",
      icon: Code,
      count: 4,
      tasks: [
        { id: "1", title: "Complete React course", priority: "medium", tags: ["react", "frontend"] },
        { id: "2", title: "Build component library", priority: "low", tags: ["components", "reusable"] },
        { id: "3", title: "Update portfolio site", priority: "medium", tags: ["portfolio", "showcase"] },
        { id: "4", title: "Learn Next.js 15", priority: "high", tags: ["nextjs", "framework"] },
      ],
    },
  ],
  timeline: [],
  priority: [],
}

const viewIcons = {
  "work-type": Briefcase,
  technology: Code,
  timeline: Calendar,
  priority: Clock,
}

const viewLabels = {
  "work-type": "Work Type",
  technology: "Technology",
  timeline: "Timeline",
  priority: "Priority",
}

export default function TaskManager() {
  const [currentView, setCurrentView] = useState<ViewType>("work-type")
  const [expandedTile, setExpandedTile] = useState<string | null>(null)
  const [hoveredTile, setHoveredTile] = useState<string | null>(null)
  const [categories, setCategories] = useState(initialData)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({
    title: "",
    color: colorOptions[0].color,
    gradient: colorOptions[0].gradient,
    icon: iconOptions[0].icon,
  })
  const [user, setUser] = useState<User | null>(null);
const [activeAddTaskCategoryId, setActiveAddTaskCategoryId] = useState<string | null>(null);

  // Add Task handler
  const handleAddTask = (categoryId: string, taskData: { title: string; priority: string; tags: string[] }) => {
    setCategories(prev => {
      const updated = { ...prev };
      updated[currentView] = updated[currentView].map(cat => {
        if (cat.id === categoryId) {
          const newTask = {
            id: Date.now().toString(),
            title: taskData.title,
            priority: taskData.priority as Task["priority"],
            tags: taskData.tags,
          };
          return {
            ...cat,
            tasks: [...cat.tasks, newTask],
            count: cat.count + 1,
          };
        }
        return cat;
      });
      return updated;
    });
    setActiveAddTaskCategoryId(null);
  };


  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleTileClick = (categoryId: string) => {
    setExpandedTile(expandedTile === categoryId ? null : categoryId)
  }

  const handleCreateCategory = () => {
    if (!newCategory.title.trim()) return

    const category: Category = {
      id: Date.now().toString(),
      title: newCategory.title,
      color: newCategory.color,
      gradient: newCategory.gradient,
      icon: newCategory.icon,
      tasks: [],
      count: 0,
    }

    setCategories((prev) => ({
      ...prev,
      [currentView]: [...prev[currentView], category],
    }))

    setNewCategory({
      title: "",
      color: colorOptions[0].color,
      gradient: colorOptions[0].gradient,
      icon: iconOptions[0].icon,
    })
    setIsCreateDialogOpen(false)
  }

  const handleSignOut = () => {
    // In real app: supabase.auth.signOut()
    setUser(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200"
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "low":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Task Manager</h1>
              <p className="text-gray-600">Organize your work with focus and clarity</p>
            </div>
            <Button
              className="w-full"
              size="lg"
              // TODO: Replace with real logout or other user logic as needed

// Example: Display user email in the UI (update your header or wherever needed):
// <div>{user?.email || "Not logged in"}</div>

            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Tasks</h1>

            {/* AppTaskTaskUser Menu */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.email || "Not logged in"}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* View Switcher */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
            {(Object.keys(viewLabels) as ViewType[]).map((view) => {
              const Icon = viewIcons[view]
              return (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={cn(
                    "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                    currentView === view ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900",
                  )}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{viewLabels[view]}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {categories[currentView].map((category) => {
            const Icon = category.icon
            const isExpanded = expandedTile === category.id
            const isHovered = hoveredTile === category.id
            const isOtherExpanded = expandedTile && expandedTile !== category.id

            return (
              <div
                key={category.id}
                className={cn(
                  "transition-all duration-500 ease-out",
                  isExpanded ? "sm:col-span-2 lg:col-span-3 xl:col-span-4" : "",
                  isOtherExpanded ? "opacity-30 scale-95" : "opacity-100 scale-100",
                )}
              >
                <Card
                  className={cn(
                    "cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300 ease-out overflow-hidden",
                    isHovered && !isExpanded ? "scale-105 shadow-lg" : "",
                    isExpanded ? "shadow-2xl" : "",
                  )}
                  onClick={() => handleTileClick(category.id)}
                  onMouseEnter={() => setHoveredTile(category.id)}
                  onMouseLeave={() => setHoveredTile(null)}
                >
                  {/* Tile Header */}
                  <div className={cn("p-4 sm:p-6 text-white", category.gradient)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base sm:text-lg">{category.title}</h3>
                          <p className="text-white/80 text-xs sm:text-sm">{category.count} tasks</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl sm:text-2xl font-bold">{category.count}</div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <CardContent className="p-4 sm:p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 mr-2">
                                {task.title}
                              </h4>
                              <Badge
                                variant="outline"
                                className={cn("text-xs shrink-0", getPriorityColor(task.priority))}
                              >
                                {task.priority}
                              </Badge>
                            </div>

                            {task.dueDate && (
                              <p className="text-xs text-gray-500 mb-3">
                                Due {new Date(task.dueDate).toLocaleDateString()}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-1">
                              {task.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {task.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                  +{task.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Add Task Dialog (per category) */}
<Dialog open={activeAddTaskCategoryId === category.id} onOpenChange={open => setActiveAddTaskCategoryId(open ? category.id : null)}>
  <DialogTrigger asChild>
    <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center cursor-pointer"
      onClick={e => { e.stopPropagation(); setActiveAddTaskCategoryId(category.id); }}>
      <div className="text-center">
        <Plus className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 font-medium">Add Task</p>
      </div>
    </div>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add a New Task</DialogTitle>
    </DialogHeader>
    <form
      onSubmit={e => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const title = (form.elements.namedItem('title') as HTMLInputElement).value;
        const priority = (form.elements.namedItem('priority') as HTMLSelectElement).value;
        const tags = (form.elements.namedItem('tags') as HTMLInputElement).value.split(',').map(t => t.trim()).filter(Boolean);
        handleAddTask(category.id, { title, priority, tags });
      }}
    >
      <Label htmlFor="title">Title</Label>
      <Input id="title" name="title" required className="mb-4" />
      <Label htmlFor="priority">Priority</Label>
      <select id="priority" name="priority" className="mb-4 w-full border rounded p-2">
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <Label htmlFor="tags">Tags (comma separated)</Label>
      <Input id="tags" name="tags" className="mb-4" />
      <Button type="submit" className="w-full mt-2">Add Task</Button>
    </form>
  </DialogContent>
</Dialog>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            )
          })}

          {/* Add Category Tile */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 min-h-[140px] flex items-center justify-center">
                <div className="text-center p-6">
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-600">Add Category</p>
                </div>
              </Card>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Category Name</Label>
                  <Input
                    id="title"
                    value={newCategory.title}
                    onChange={(e) => setNewCategory((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Side Projects"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Color</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.name}
                        onClick={() =>
                          setNewCategory((prev) => ({
                            ...prev,
                            color: color.color,
                            gradient: color.gradient,
                          }))
                        }
                        className={cn(
                          "w-full h-12 rounded-lg transition-all duration-200",
                          color.gradient,
                          newCategory.color === color.color ? "ring-2 ring-gray-900 ring-offset-2" : "hover:scale-105",
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Icon</Label>
                  <div className="grid grid-cols-6 gap-2 mt-2">
                    {iconOptions.map((iconOption) => {
                      const IconComponent = iconOption.icon
                      return (
                        <button
                          key={iconOption.name}
                          onClick={() => setNewCategory((prev) => ({ ...prev, icon: IconComponent }))}
                          className={cn(
                            "p-3 rounded-lg border-2 transition-all duration-200 hover:bg-gray-50",
                            newCategory.icon === IconComponent ? "border-gray-900 bg-gray-100" : "border-gray-200",
                          )}
                        >
                          <IconComponent className="w-5 h-5 mx-auto" />
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCategory} className="flex-1" disabled={!newCategory.title.trim()}>
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
