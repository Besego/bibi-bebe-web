export type MainComponentProps = {
    currentDate: Date;
}

export type NavigatePanelProps = {
    currentDate: Date;
    goToPreviousWeek: () => void;
    goToNextWeek: () => void;
}


export type DayBlockProps = {
    date: string;
    dayOfWeek: string;
}

export interface TaskListProps {
    tasks: Task[];
    onAddTask: (text: string, date: string) => void;
    onToggleTaskCompletion: (taskId: string) => void;
    date: string;
}

export interface DayInfoProps {
    date: string;
    dayOfWeek: string;
}

export interface TaskItemProps {
    task: Task;
    date: string;
    onToggleTaskCompletion: (taskId: string) => void;
}

export interface Task {
    id: string; // Временный UUID или строковое представление task_id
    space_id: string; // UUID пространства
    user_id: string; // UUID пользователя
    parent_task_id?: number | null; // ID родительской задачи или null
    title: string; // Название задачи (заменяет старое поле text)
    description?: string | null; // Описание задачи (опционально)
    status: boolean; // Статус выполнения (заменяет старое поле done)
    created_at?: string; // Дата создания в формате строки
    updated_at?: string; // Дата обновления в формате строки
    due_date?: string | null; // Срок выполнения (заменяет старое поле date)
    display_date?: string | null
    completion_date?: string | null; // Дата завершения
    is_repeating: boolean; // Повторяющаяся задача
    repeat_interval?: string | null; // Интервал повторения
    planning_period?: string | null; // Период планирования
    is_urgent: boolean; // Срочная задача
    is_important: boolean; // Важная задача
    reward_id?: string | null; // UUID награды (опционально)
    is_anime_task: boolean; // Аниме-задача
    deleted?: boolean; // Флаг удаления (опционально, если используется soft delete)
}

export interface User {
    user_id: string
    username: string
    email: string
    avatar_url: string
    displayed_title_id: string
}

export interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User;
    signIn: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUp: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signOut: () => Promise<void>;
    // getUserInfo: () => Promise<void>;
    createUserSpace(spaceName: string): () => Promise<void>;
}

export interface Space {
    space_id: string
    space_name: string
    created_by: string
    created_at: string
}

export interface TaskMenuProps {
    task: Task;
    visible: boolean;
    date: string;
    onClose: () => void;
    title: string;
    setTitle: (title: string) => void;
    description: string;
    setDescription: (description: string) => void;
}

export type CustomTextProps = {
    content: string;
    size: number;
    color: string;
    weight: 'normal' | 'bold' | '600' | '700' | '400';
    lineThrough?: boolean;
    opacity?: number;
    borderRadius?: number;
    borderColor?: string;
    borderWidth?: number;
    backgroundColor?: string;
    paddingHorizontal?: number
}