# Task Management Application

An Angular 20 task management application with MobX state management, rich text editing, multi-level comments, and calendar integration.

## 🚀 Features

- **Task List Page**
  - Display tasks with title, description preview, deadline, and status
  - Add, edit, and delete tasks
  - Click on task to view details
  
- **Task Details Page**
  - Full task information display
  - Rich text editor (ngx-quill) for descriptions
  - Multi-level comment threads with nested replies
  - Real-time updates with MobX

- **Calendar View**
  - FullCalendar integration
  - Tasks displayed by deadline
  - Color-coded by status (Red: Pending, Orange: In Progress, Green: Completed)
  - Click calendar events to navigate to task details

## 🛠️ Technologies Used

- **Angular 20** - Standalone components (no NgModules)
- **MobX** - State management
- **ngx-quill** - Rich text editor
- **FullCalendar** - Calendar integration
- **TypeScript** - Type safety
- **RxJS** - Reactive programming
- **CSS3** - Modern styling

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
```bash
git clone <https://github.com/hdaamzz/Task-Management-Angular-20>
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
ng serve
```

4. **Open the application**
Navigate to `http://localhost:4200/`

## 📁 Project Structure

```
src/app/
├── core/
│   ├── models/          # Data models (Task, Comment)
│   └── services/        # Services (TaskService)
├── stores/              # MobX stores (TaskStore, CommentStore)
├── features/
│   ├── task-list/       # Task list component
│   ├── task-details/    # Task details component
│   └── calendar-view/   # Calendar component
├── shared/
│   └── components/
│       ├── task-form/   # Task creation/edit form
│       └── comment-thread/  # Multi-level comments
├── app.component.ts     # Root component
├── app.routes.ts        # Routing configuration
└── app.config.ts        # App configuration
```

## 🎯 Usage

### Adding a Task
1. Click "➕ Add New Task" on the task list page
2. Fill in the task details:
   - Title (required)
   - Description with rich text formatting
   - Deadline date
   - Status (Pending/In Progress/Completed)
3. Click "Create Task"

### Viewing Task Details
1. Click on any task card in the task list
2. View full task information
3. Add comments and reply to existing comments

### Using the Calendar
1. Navigate to the Calendar tab
2. View tasks organized by deadline
3. Click any task event to view details
4. Color legend shows task status

### Managing Comments
1. Add top-level comments in the text area
2. Click "Reply" on any comment to add a nested reply
3. Comments support unlimited nesting levels
4. Delete comments using the trash icon

## 🔧 Configuration

### TypeScript Configuration
The project uses TypeScript with experimental decorators enabled for MobX:

{
  "compilerOptions": {
    "experimentalDecorators": true,
    "useDefineForClassFields": false
  }
}

### Data Source
Tasks are loaded from `src/assets/tasks.json`. You can modify this file to add initial tasks.

## 📝 Best Practices Implemented

1. **Standalone Components** - Following Angular 20 best practices
2. **MobX State Management** - Centralized reactive state
3. **Lazy Loading** - Components loaded on demand
4. **Separation of Concerns** - Clear separation between services, stores, and components
5. **Type Safety** - Full TypeScript type coverage
6. **Reactive Forms** - For form handling and validation
7. **Clean Code** - Well-organized and maintainable codebase

## 🚀 Build for Production

```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🤝 Contributing

This is a technical assignment project. Feel free to fork and modify as needed.

## 📄 License

MIT License - Feel free to use this project for learning purposes.

## 👨‍💻 Author

Developed as part of the Angular Developer assignment.

---

**Note**: This application demonstrates proficiency in Angular 20, MobX state management, component architecture, and integration with third-party libraries.