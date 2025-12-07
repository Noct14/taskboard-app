# 📋 Taskify

Taskify is a modern and intuitive Kanban-based task management application built with Next.js 16. This application helps teams organize their work effortlessly using a responsive drag-and-drop interface.

![Taskify](https://img.shields.io/badge/Next.js-16.0.7-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-0.8.0-green?style=for-the-badge&logo=supabase)
![Clerk](https://img.shields.io/badge/Clerk-6.35.5-purple?style=for-the-badge)

## ✨ Features

### 🎯 Task Management
- **Drag & Drop**: Move tasks between columns effortlessly using drag-and-drop
- **Task Priorities**: Mark tasks with priorities (Low, Medium, High)
- **Assignees**: Assign tasks to team members
- **Due Dates**: Set deadline dates for each task
- **Task Descriptions**: Add complete details for each task

### 📊 Board Management
- **Multiple Boards**: Create and manage multiple boards for different projects
- **Customizable Columns**: Create, edit, and delete columns as needed
- **Board Colors**: Choose custom colors for each board
- **Filter & Search**: Search and filter boards based on various criteria

### 🔍 Filtering & Search
- Filter tasks by priority
- Filter by due date
- Board search in dashboard
- Filter boards by date and task count

### 👥 Authentication & Security
- **Clerk Authentication**: Secure and easy-to-use authentication system
- **User Management**: Integrated user management
- **Secure API**: Secure API with Supabase

### 💳 Pricing Plans
- **Free Plan**: 1 free board
- **Pro Plan**: Unlimited boards
- **Enterprise Plan**: Full features for large teams

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Radix UI** - Accessible UI components
- **Lucide React** - Icon library

### Backend & Database
- **Supabase** - Backend as a Service (BaaS)
- **PostgreSQL** - Database (via Supabase)

### Authentication
- **Clerk** - Authentication & user management

### Drag & Drop
- **@dnd-kit/core** - Core drag and drop functionality
- **@dnd-kit/sortable** - Sortable lists
- **@dnd-kit/utilities** - Utility functions

### Other Libraries
- **class-variance-authority** - Variant management
- **clsx** - Conditional classnames
- **tailwind-merge** - Merge Tailwind classes

## 📋 Prerequisites

Before you begin, make sure you have installed:

- **Node.js** 18.x or higher
- **npm** or **yarn** or **pnpm**
- **Clerk** account (for authentication)
- **Supabase** account (for database)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/taskify.git
   cd taskify
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Setup environment variables**

   Create a `.env.local` file in the root directory and add the following variables:

   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Setup Supabase Database**

   Create the following tables in Supabase:

   ```sql
   -- Boards Table
   CREATE TABLE boards (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     title TEXT NOT NULL,
     description TEXT,
     color TEXT DEFAULT 'bg-blue-500',
     user_id TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Columns Table
   CREATE TABLE columns (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     title TEXT NOT NULL,
     board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
     user_id TEXT NOT NULL,
     sort_order INTEGER NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Tasks Table
   CREATE TABLE tasks (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     title TEXT NOT NULL,
     description TEXT,
     assignee TEXT,
     due_date DATE,
     priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
     column_id UUID REFERENCES columns(id) ON DELETE CASCADE,
     sort_order INTEGER NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security (RLS)
   ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
   ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

   -- Policies for Boards
   CREATE POLICY "Users can view their own boards"
     ON boards FOR SELECT
     USING (auth.uid()::text = user_id);

   CREATE POLICY "Users can create their own boards"
     ON boards FOR INSERT
     WITH CHECK (auth.uid()::text = user_id);

   CREATE POLICY "Users can update their own boards"
     ON boards FOR UPDATE
     USING (auth.uid()::text = user_id);

   CREATE POLICY "Users can delete their own boards"
     ON boards FOR DELETE
     USING (auth.uid()::text = user_id);

   -- Policies for Columns
   CREATE POLICY "Users can view columns of their boards"
     ON columns FOR SELECT
     USING (
       EXISTS (
         SELECT 1 FROM boards
         WHERE boards.id = columns.board_id
         AND boards.user_id = auth.uid()::text
       )
     );

   CREATE POLICY "Users can create columns in their boards"
     ON columns FOR INSERT
     WITH CHECK (
       EXISTS (
         SELECT 1 FROM boards
         WHERE boards.id = columns.board_id
         AND boards.user_id = auth.uid()::text
       )
     );

   CREATE POLICY "Users can update columns in their boards"
     ON columns FOR UPDATE
     USING (
       EXISTS (
         SELECT 1 FROM boards
         WHERE boards.id = columns.board_id
         AND boards.user_id = auth.uid()::text
       )
     );

   CREATE POLICY "Users can delete columns in their boards"
     ON columns FOR DELETE
     USING (
       EXISTS (
         SELECT 1 FROM boards
         WHERE boards.id = columns.board_id
         AND boards.user_id = auth.uid()::text
       )
     );

   -- Policies for Tasks
   CREATE POLICY "Users can view tasks in their boards"
     ON tasks FOR SELECT
     USING (
       EXISTS (
         SELECT 1 FROM columns
         JOIN boards ON boards.id = columns.board_id
         WHERE columns.id = tasks.column_id
         AND boards.user_id = auth.uid()::text
       )
     );

   CREATE POLICY "Users can create tasks in their boards"
     ON tasks FOR INSERT
     WITH CHECK (
       EXISTS (
         SELECT 1 FROM columns
         JOIN boards ON boards.id = columns.board_id
         WHERE columns.id = tasks.column_id
         AND boards.user_id = auth.uid()::text
       )
     );

   CREATE POLICY "Users can update tasks in their boards"
     ON tasks FOR UPDATE
     USING (
       EXISTS (
         SELECT 1 FROM columns
         JOIN boards ON boards.id = columns.board_id
         WHERE columns.id = tasks.column_id
         AND boards.user_id = auth.uid()::text
       )
     );

   CREATE POLICY "Users can delete tasks in their boards"
     ON tasks FOR DELETE
     USING (
       EXISTS (
         SELECT 1 FROM columns
         JOIN boards ON boards.id = columns.board_id
         WHERE columns.id = tasks.column_id
         AND boards.user_id = auth.uid()::text
       )
     );
   ```

5. **Setup Clerk**

   - Sign up at [Clerk](https://clerk.com)
   - Create a new application
   - Copy the Publishable Key and Secret Key to `.env.local`
   - Configure redirect URLs in the Clerk dashboard

6. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

7. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
taskify/
├── app/                    # Next.js App Router
│   ├── boards/            # Board pages
│   │   └── [id]/         # Dynamic route for board detail
│   ├── dashboard/         # Dashboard page
│   ├── pricing/          # Pricing page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   └── navbar.tsx        # Navigation component
├── lib/                  # Utility functions & services
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── services.ts       # API services
│   ├── supabase/         # Supabase configuration
│   └── utils.ts          # Utility functions
├── public/               # Static assets
├── middleware.ts         # Next.js middleware (Clerk)
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── tailwind.config.js    # Tailwind CSS config
```

## 🎮 Usage

### Creating a New Board
1. Log in to the application
2. Click the "Create Board" button on the dashboard
3. A new board will be created with default columns (To Do, In Progress, Review, Done)

### Managing Tasks
1. Open the board you want to manage
2. Click "Add Task" on the desired column
3. Fill in task details (title, description, assignee, priority, due date)
4. Click "Create Task"

### Moving Tasks
1. Drag a task from one column to another
2. Or drag to change the order within the same column
3. Changes will be saved automatically

### Filtering Tasks
1. Click the "Filter" button in the navbar
2. Select filters by priority or due date
3. Click "Apply Filters"

### Editing a Board
1. Click the edit icon in the navbar
2. Change the board title or color
3. Click "Save Changes"

## 🔧 Scripts

```bash
# Development
npm run dev          # Run development server

# Production
npm run build        # Build for production
npm run start        # Run production server

# Linting
npm run lint         # Run ESLint
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Environment Variables for Production

Make sure to add all environment variables on your deployment platform:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

See the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Made with ❤️ by Andhika Putratama

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Supabase](https://supabase.com) - Backend as a Service
- [Clerk](https://clerk.com) - Authentication
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [dnd-kit](https://dndkit.com) - Drag and drop library

---

⭐ If this project helped you, don't forget to give it a star!
