import axios from 'axios';
import { message } from 'antd';
import dayjs from 'dayjs';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error al registrar usuario:', error.response?.data || error.message);
    throw error;
  }
};

// Login de usuario
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error al iniciar sesión:', error.response?.data || error.message);
    throw error;
  }
};

// Obtener tareas
export const getTasks = async (token) => {
  try {
    const response = await api.get('/tasks', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener tareas:', error.response?.data || error.message);
    throw error;
  }
};

// Obtener usuarios
export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los usuarios:', error.response?.data || error.message);
    throw error;
  }
};

// Actualizar rol de usuario con PUT
export const updateUserRole = async (userId, newRole) => {
  try {
    const response = await api.put(`/users/${userId}`, { role: newRole }); 
    return response.data;
  } catch (error) {
    console.error('Error al cambiar el rol del usuario:', error.response?.data || error.message);
    throw error;
  }
};


// Funciones relacionadas con tareas
export const fetchTasks = async (userId, setTasks) => {
  if (!userId) {
    message.error("Usuario no autenticado");
    return;
  }

  try {
    const response = await api.get(`/tasks/${userId}`);
    setTasks(response.data.tasks);
  } catch (error) {
    message.error("Error al obtener tareas");
  }
};

export const saveTask = async (values, userId, form, setVisible, fetchTasks) => {
  if (!userId) {
    message.error("Usuario no autenticado");
    return;
  }

  try {
    const taskData = {
      userId,
      ...values,
      timeUntilFinish: values.timeUntilFinish.format("YYYY-MM-DD"),
    };

    await api.post('/tasks', taskData);
    message.success("Tarea guardada");

    form.resetFields();
    setVisible(false);
    fetchTasks(userId, fetchTasks);
  } catch (error) {
    message.error("Error al guardar la tarea");
  }
};

export const deleteTask = async (taskId, userId, fetchTasks) => {
  if (!userId) {
    message.error("Usuario no autenticado");
    return;
  }

  try {
    await api.delete(`/tasks/${userId}/${taskId}`);
    fetchTasks(userId, fetchTasks);
  } catch (error) {
    message.error("Error al eliminar la tarea");
  }
};

// Funciones relacionadas con grupos
export const fetchGroups = async () => {
  try {
    const response = await api.get('/groups');
    return response.data;
  } catch (error) {
    message.error("Error al obtener los grupos");
    return [];
  }
};

export const fetchUsers = async () => {
  try {
    const response = await api.get('/groups/users');
    return response.data;
  } catch (error) {
    message.error("Error al obtener usuarios");
    return [];
  }
};

export const createGroup = async (groupData) => {
  try {
    const response = await api.post('/groups', groupData);
    message.success("Grupo creado");
    return true;
  } catch (error) {
    message.error("Error al crear el grupo");
    return false;
  }
};

export const updateGroupStatus = async (groupId, newStatus) => {
  try {
    const response = await api.put(`/groups/${groupId}/status`, { estatus: newStatus });
    message.success("Estatus actualizado correctamente.");
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el estatus del grupo:', error.response?.data || error.message);
    message.error("Error al actualizar el estatus");
    return null;
  }
};


export default api;
