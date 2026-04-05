# Kanban Board - Premium Task Management App

A modern, production-quality Kanban board built with React, featuring optimistic UI updates with intelligent rollback on API failures. Built with Vite, React, Tailwind CSS, and dnd-kit for a smooth user experience.

##  Features

### Core Functionality
- **Drag & Drop**: Seamlessly move tasks between columns (To Do, In Progress, Done)
- **Optimistic UI Updates**: Instant visual feedback when moving tasks
- **Smart Rollback**: Automatically reverts changes if the API request fails
- **Mock API**: Simulates network delay (1.5s) with 20% failure rate for testing
- **Real-time Notifications**: Toast notifications for success and error states

### UI/UX Excellence
- **Modern Design**: Clean, professional interface reminiscent of SaaS products
- **Smooth Animations**: Polished transitions and hover effects
- **Responsive Layout**: Optimized for different screen sizes
- **Priority Badges**: Visual indicators for task priority (High, Medium, Low)
- **Task Metadata**: Descriptions and priority levels for better organization
- **Empty States**: Helpful messages when columns are empty

##  Tech Stack

- **React 19** - UI framework with hooks
- **Vite 8** - Lightning-fast build tool
- **Tailwind CSS 4** - Utility-first CSS framework
- **dnd-kit** - Headless drag-and-drop library
- **react-hot-toast** - Beautiful notifications
- **react-icons** - Icon library (HeroIcons)
- **JavaScript/ES6+** - Modern JavaScript

##  Project Structure

```
src/
├── components/
│   ├── Board.jsx           # Main board component with drag-drop logic
│   ├── Column.jsx          # Column component for task grouping
│   └── TaskCard.jsx        # Individual task card component
├── utils/
│   └── mockApi.js          # Mock API with 1.5s delay and 20% failure
├── App.jsx                 # Main app component
├── App.css                 # Global styles and animations
├── index.css               # Tailwind CSS setup
└── main.jsx                # Entry point
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm (or yarn)

### Installation

1. **Clone the repository** (or navigate to the project directory)
   ```bash
   cd /Users/shivamkumaryadav/Desktop/flo_pract
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Local: http://localhost:5174 (or the displayed port)
   - The app will hot-reload on code changes

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

##  Core Implementation Details

### Optimistic UI Updates & Rollback

The application demonstrates production-grade error handling:

1. **Optimistic Update**: When you drag a task to a new column, the UI updates instantly
2. **Background Request**: A mock API call is made with a 1.5-second delay
3. **Success Path**: If the API succeeds, the state remains as updated
4. **Failure Path**: If the API fails (20% chance), the task snaps back to its original column with a toast notification

**Code Location**: `src/components/Board.jsx` (lines 76-125)

### Mock API

The mock API simulates a real backend with:
- 1.5-second network delay (using `setTimeout`)
- Random 20% failure rate to test error handling
- Proper error throwing and promise resolution

**Code Location**: `src/utils/mockApi.js`

### Drag & Drop Implementation

Uses **dnd-kit** for robust drag-and-drop:
- Each task has sortable functionality within columns
- Each column is a droppable target
- Smooth animations and visual feedback during drag
- Proper collision detection with `closestCorners`

**Code Locations**:
- Board logic: `src/components/Board.jsx`
- Column setup: `src/components/Column.jsx`
- Task card: `src/components/TaskCard.jsx`

##  Sample Tasks

The board comes pre-populated with 8 sample tasks:
- **Done**: Set up project structure, Design database schema
- **In Progress**: API integration setup, User authentication, Performance optimization
- **To Do**: Create unit tests, Design UI mockups, Documentation

Each task includes a title, description, priority level, and status.

##  Design Highlights

### Color Scheme
- **To Do**: Blue theme
- **In Progress**: Amber theme
- **Done**: Green theme
- **Background**: Soft gradient (slate-50 → slate-50)

### Interactive Elements
- **Task Cards**: Rounded corners, shadows, hover effects, smooth transitions
- **Drag Feedback**: Scaled card, visual highlight, shadow enhancement
- **Column Highlight**: Border glow when dragging over
- **Notifications**: Styled toasts with animations

### Typography & Spacing
- Clear hierarchy with semibold headers
- Consistent padding and margins
- Readable line heights
- Professional font stack

##  Performance Optimizations

- **React Hooks**: Efficient state management with `useState` and `useCallback`
- **Memoization**: `useCallback` for drag handlers prevents unnecessary re-renders
- **CSS Transitions**: Hardware-accelerated transforms
- **Lazy Loading**: Components are lightweight and efficient
- **Tailwind Purge**: Only used classes are included in production

##  Testing the Features

### Try These Scenarios:

1. **Successful Update**: Drag a task from "To Do" to "In Progress" - The task moves and a success toast appears
2. **Trigger Failure**: Keep dragging tasks until you see a failure (20% chance) - Watch the task snap back!
3. **Empty Column**: Drag all tasks from "To Do" - See the empty state message
4. **Multiple Moves**: Quickly drag multiple tasks - Watch smooth state management


### Tailwind Styles Not Loading
```bash
# Rebuild Tailwind
npm run build
# The styles should be in dist/style.css
```

### Drag & Drop Not Working
- Ensure `dnd-kit` packages are installed: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- Check browser console for errors
- Try clearing browser cache

##  Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [dnd-kit Documentation](https://docs.dndkit.com)
- [react-hot-toast](https://react-hot-toast.com)
- [Vite Guide](https://vitejs.dev)



