import { createClient } from '@supabase/supabase-js';
// import { Database } from './database.types';
import { observable } from '@legendapp/state';
import { syncedSupabase } from '@legendapp/state/sync-plugins/supabase';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { configureSynced } from '@legendapp/state/sync';
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage"
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useEffect } from 'react';
import { getCurrentSpaceId, getSpace } from '@/storages/spaceStorage';
import { Task } from '@/types/types';

// Очищаем AsyncStorage при необходимости (раскомментируйте для отладки)
// useEffect(() => {
//   AsyncStorage.clear();
// }, []);

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

const generateId = () => uuidv4();

const customSynced = configureSynced(syncedSupabase, {
  persist: {
    plugin: ObservablePersistLocalStorage,
        retrySync: true
  },
  generateId,
  supabase,
  changesSince: 'last-sync',
  fieldCreatedAt: 'created_at',
  fieldUpdatedAt: 'updated_at',
  onError: (error) => {
    console.error('Ошибка синхронизации с Supabase:', error);
  },
});

export const tasks$ = observable(
  customSynced({
    supabase,
    collection: 'tasks',
    select: (from) =>
      from.select(
        'id, space_id, user_id, parent_task_id, title, description, status, created_at, updated_at, due_date, display_date, completion_date, is_repeating, repeat_interval, planning_period, is_urgent, is_important, reward_id, is_anime_task'
      ),
    filter: (select) => select.eq('space_id', "37366bcc-a1d5-4025-aa34-66efcb1e632a"),
    actions: ['read', 'create', 'update', 'delete'],
    realtime: true,
    persist: {
      name: 'tasks',
      retrySync: true,
    },
    retry: {
      infinite: true,
    },
    onError: (error) => {
      console.error('Ошибка в tasks$:', error);
    },
  })
);

export const addTask = (
  title: string,
  space_id: string,
  user_id: string,
  due_date: string,
  display_date: string,
  status?: boolean,
  description?: string,
  parent_task_id?: string,
  created_at?: string,
  updated_at?: string,
  completion_date?: string,
  is_repeating?: boolean,
  repeat_interval?: string,
  planning_period?: string,
  is_urgent?: boolean,
  is_important?: boolean,
  reward_id?: string,
  is_anime_task?: boolean
) => {
  try {
    const newId = uuidv4();
    const now = new Date();
    const isoNow = now.toISOString();
    const taskData = {
      id: newId,
      space_id: space_id,
      user_id: user_id,
      title: title,
      status: status || false,
      due_date: due_date || isoNow,
      display_date: display_date, // YYYY-MM-DD
      description: description || null,
      parent_task_id: parent_task_id || null, // Всегда используем переданный parent_task_id
      created_at: created_at || isoNow, // Фиксируем дату создания
      updated_at: isoNow,
      completion_date: completion_date || null,
      is_repeating: is_repeating || false,
      repeat_interval: repeat_interval || null,
      planning_period: planning_period || null,
      is_urgent: is_urgent || false,
      is_important: is_important || false,
      reward_id: reward_id || null,
      is_anime_task: is_anime_task || false,
    };
    console.log('Данные для вставки в Supabase:', taskData); // Добавляем лог для отладки
    tasks$.set((prev) => ({
      ...prev,
      [newId]: taskData,
    }));
    console.log('Task added:', { id: newId, title, due_date, display_date, created_at: taskData.created_at });
    // Принудительная вставка для отладки
    return supabase.from('tasks').insert([taskData]).then(({ error }) => {
      if (error) {
        console.error('Ошибка вставки в Supabase:', error);
        return Promise.reject(error);
      } else {
        console.log('Задача успешно сохранена в Supabase:', taskData);
        return Promise.resolve(newId); // Возвращаем newId при успехе
      }
    });
  } catch (error) {
    console.error('Ошибка добавления задачи:', error);
    return Promise.reject(error);
  }
};

export const toggleTaskCompletion = (taskId: string) => {
  tasks$[taskId].status.set((prev) => !prev);
};

export const toggleTaskRename = (taskId: string, newTitle: string) => {
  tasks$[taskId].title.set((prev) => newTitle);
};

export const toggleTaskRenameDescription = (taskId: string, newDescription: string) => {
  tasks$[taskId].description.set((prev) => newDescription);
};

export const toggleTaskChangeDate = (taskId: string, newDate: string) => {
  tasks$[taskId].due_date.set((prev) => newDate);
};

export const toggleTaskChangeDisplayDate = (taskId: string, newDisplayDate: string) => {
  tasks$[taskId].display_date.set((prev) => newDisplayDate);
};

export const toggleTaskRemove = (taskId: string) => {
  const task = tasks$[taskId].get();
  if (task.description === null) {
    tasks$[taskId].description.set('');
  }
  tasks$[taskId].delete();
};

export const toggleDublicateTask = async (
  title: string,
  space_id: string,
  user_id: string,
  due_date: string,
  display_date: string,
  status?: boolean,
  description?: string,
  parent_task_id?: string,
  created_at?: string,
  updated_at?: string,
  completion_date?: string,
  is_repeating?: boolean,
  repeat_interval?: string,
  planning_period?: string,
  is_urgent?: boolean,
  is_important?: boolean,
  reward_id?: string,
  is_anime_task?: boolean,
  originalTaskId?: string,
  subtasks?: Task[] // Новый параметр для подзадач
) => {
  try {
    const newId = uuidv4();
    const now = new Date();
    const dateString = now.toISOString();

    // Дублируем основную задачу и ждём подтверждения вставки
    const mainTaskId = await addTask(
      title,
      space_id,
      user_id,
      due_date,
      display_date,
      status || false,
      description || null,
      parent_task_id || null,
      created_at || dateString,
      dateString,
      completion_date || null,
      is_repeating || false,
      repeat_interval || null,
      planning_period || null,
      is_urgent || false,
      is_important || false,
      reward_id || null,
      is_anime_task || false
    );

    // Дублируем подзадачи, если они переданы
    if (!parent_task_id && subtasks && subtasks.length > 0) {
      for (const subtask of subtasks) {
        console.log('Дублируем подзадачу с parent_task_id:', mainTaskId); // Лог для отладки
        await addTask(
          subtask.title,
          subtask.space_id,
          subtask.user_id,
          subtask.due_date,
          subtask.display_date,
          subtask.status,
          subtask.description,
          mainTaskId, // Устанавливаем новую дублированную задачу как родительскую
          subtask.created_at,
          subtask.updated_at,
          subtask.completion_date,
          subtask.is_repeating,
          subtask.repeat_interval,
          subtask.planning_period,
          subtask.is_urgent,
          subtask.is_important,
          subtask.reward_id,
          subtask.is_anime_task
        );
      }
    }

    console.log('Задача дублирована с ID:', newId);
  } catch (error) {
    console.error('Ошибка дублирования задачи:', error);
    throw error; // Пробрасываем ошибку для отладки
  }
};

export const changeEisenhowerMatrixStatus = (taskId: string, isUrgent: boolean, isImportant: boolean) => {
  tasks$[taskId].is_urgent.set((prev) => isUrgent);
  tasks$[taskId].is_important.set((prev) => isImportant);
};