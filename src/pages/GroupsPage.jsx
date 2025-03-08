import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Input, Card, Select, message } from "antd";
import { fetchGroups, fetchUsers, createGroup, updateGroupStatus } from "../services/api";

const GroupsPage = () => {
  const [visible, setVisible] = useState(false);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [form] = Form.useForm();
  const user = localStorage.getItem("user");
  const userId = user ? JSON.parse(user).userId : null;

  useEffect(() => {
    loadGroups();
    loadUsers();
  }, []);

  const loadGroups = async () => {
    const data = await fetchGroups(userId);
    setGroups(data);
  };

  const loadUsers = async () => {
    const data = await fetchUsers();
    setUsers(data);
    const userMap = data.reduce((acc, user) => {
      acc[user.id] = user.username || user.email;
      return acc;
    }, {});
    setUsersMap(userMap);
  };

  const handleSubmit = async (values) => {
    const uniqueMembers = Array.from(new Set([userId, ...values.members]));

    const newGroup = {
      name: values.name,
      description: values.description,
      members: uniqueMembers,
      createdBy: userId,
      estatus: values.estatus,
    };

    if (await createGroup(newGroup, userId)) {
      form.resetFields();
      setVisible(false);
      loadGroups();
    }
  };

  const handleStatusChange = async (groupId, newStatus) => {
    if (await updateGroupStatus(groupId, newStatus)) {
      loadGroups();
      message.success("Estatus actualizado correctamente.");
    } else {
      message.error("Error al actualizar el estatus.");
    }
  };

  const estatusOrder = { "En Progreso": 1, "Pausado": 2, "En Revisión": 3, "Completado": 4 };
  const sortedGroups = [...groups].sort((a, b) => estatusOrder[a.estatus] - estatusOrder[b.estatus]);

  const filteredGroups = sortedGroups.filter(group => group.members.some(member => member.id === userId));

  const groupedByStatus = { "En Progreso": [], "Pausado": [], "En Revisión": [], "Completado": [] };
  filteredGroups.forEach(group => groupedByStatus[group.estatus].push(group));

  return (
    <div style={{ padding: "20px" }}>
      <h1>Grupos</h1>
      {Object.keys(groupedByStatus).map(status => (
        <div key={status} style={{ marginBottom: "30px" }}>
          <h2>{status}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
            {groupedByStatus[status].length > 0 ? (
              groupedByStatus[status].map((group) => (
                <Card key={group.id} title={group.name} style={{ backgroundColor: "#f0f2f5" }}>
                  <p><strong>Descripción:</strong> {group.description}</p>
                  <p><strong>Creado por:</strong> {usersMap[group.createdBy] || "Cargando nombre..."}</p>
                  <p><strong>Miembros:</strong></p>
                  <ul>{group.members.map((member) => <li key={member.id}>{member.username || "Usuario desconocido"}</li>)}</ul>

                 {/* Mostrar el campo de Estatus solo si el usuario es miembro del grupo */}
{group.members.some(member => member.id === userId) && (
  <Form
    initialValues={{ estatus: group.estatus }}
    onFinish={(values) => {
      console.log("Valores del formulario:", values); // 🔍 Debug
      handleStatusChange(group.id, values.estatus);
    }}
    layout="inline"
  >
    <Form.Item name="estatus" rules={[{ required: true, message: "Por favor selecciona un estatus" }]}>
      <Select 
        onChange={(value) => console.log("Nuevo estatus seleccionado:", value)} // 🔍 Debug
      >
        <Select.Option value="En Progreso">En Progreso</Select.Option>
        <Select.Option value="Pausado">Pausado</Select.Option>
        <Select.Option value="En Revisión">En Revisión</Select.Option>
        <Select.Option value="Completado">Completado</Select.Option>
      </Select>
    </Form.Item>
    <Form.Item>
      <Button type="primary" htmlType="submit">Actualizar Estatus</Button>
    </Form.Item>
  </Form>
)}

                </Card>
              ))
            ) : (
              <div>No hay grupos en este estatus</div>
            )}
          </div>
        </div>
      ))}

      <Button type="primary" shape="circle" size="large" style={{ position: "fixed", bottom: 20, right: 20 }} onClick={() => setVisible(true)}>+</Button>

      <Modal title="Nuevo Grupo" open={visible} onCancel={() => setVisible(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Nombre del Grupo" name="name" rules={[{ required: true, message: "Campo obligatorio" }]}><Input /></Form.Item>
          <Form.Item label="Descripción" name="description" rules={[{ required: true, message: "Campo obligatorio" }]}><Input.TextArea /></Form.Item>
          <Form.Item label="Miembros" name="members">
            <Select mode="multiple" placeholder="Selecciona miembros">
              {users.filter(user => user.id !== userId).map((user) => (
                <Select.Option key={user.id} value={user.id}>{user.username || user.email}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Estatus" name="estatus" rules={[{ required: true, message: "Campo obligatorio" }]} >
            <Select placeholder="Selecciona un estatus">
              <Select.Option value="En Progreso">En Progreso</Select.Option>
              <Select.Option value="Pausado">Pausado</Select.Option>
              <Select.Option value="En Revisión">En Revisión</Select.Option>
              <Select.Option value="Completado">Completado</Select.Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit">Guardar</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default GroupsPage;
