import React, { useState, useEffect } from "react";
import "./App.css";
import Form from "./components/Form";
import {
  getTasks,
  insertTask,
  isDoneTask,
  modifyTask,
  deleteTask,
  getUsers,
  insertUser,
  insertTaskUser,
  getTasksUsers,
  deleteTaskUser
} from "./services/todos";
import ListsContainer from "./components/ListContainer";
import CustomModal from "./components/common/CustomModal";
import useModalWithData from "./hooks/useModalWithData";
import SignIn from "./components/SignIn";
import Login from "./components/Login";
import Nav from "./components/Nav";

const App = () => {
  const handleClick = param => {
    getTasks().then(tasks => {
      console.log(tasks);
    });
  };

  //Tasks, form and modal states
  const initialFormState = {
    title: " ",
    description: " "
  };

  const initialSignInState = {
    mail: "",
    pass: ""
  };

  const initialLogedState = {
    mail: "",
    pass: ""
  };

  // const initialUserState = {
  //   user: " "
  // };
  const [logged, setLogged] = useState("false");
  const [userDB, setUser] = useState({});

  const [tasksUsers, setTasksUsers] = useState([]);

  const [logIn, setLoggin] = useState(initialLogedState);
  const [users, setUsers] = useState([]);
  const [signIn, setSignIn] = useState(initialSignInState);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(initialFormState);

  const [
    setIsModalOpened,
    isModalOpened,
    modalData,
    setModalData
  ] = useModalWithData();

  const handleChange = e => {
    const value = e.target.value;
    const title = e.target.title;
    setForm({ ...form, [title]: value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const { title, description } = form;
    if (form.id) {
      modifyTask(form.title, form.description, form.id).then(() =>
        getTasks().then(data => setTasks(data))
      );
      setIsModalOpened(false);
    } else if (title && description) {
      insertTask(title, description)
        .then(() => getTasks().then(data => setTasks(data)))
        .catch(err => alert("Imposible agregar una tarea"));
      setIsModalOpened(false);
      setForm(initialFormState);
    }
  };

  //Toma las tareas del localhost  y las setea
  useEffect(() => {
    getTasks().then(data => setTasks(data));
  }, []);
  useEffect(() => {
    getUsers().then(users => setUsers(users));
  }, []);

  useEffect(() => {
    getTasksUsers().then(data => setTasksUsers(data));
  }, []);

  const handleSubmitLogin = e => {
    e.preventDefault();
    const { mail, pass } = logIn;

    if (mail && pass) {
      const user = {
        mail,
        pass
      };
      const a = users.map(b => {
        if (user.mail === b.name && user.pass === b.pass) {
          setLogged("true");
          setUser(b);
        }
      });
      console.log("user response:", users);
      console.log("set", userDB);

      if (logged === "false") {
        setLoggin(initialLogedState);
        alert("Los datos ingresados son inválidos");
      }
    } else {
      alert("Por favor ingrese los datos");
    }
  };

  const handleSubmitSignIn = e => {
    e.preventDefault();
    const { mail, pass } = signIn;
    if (mail && pass) {
      const user = {
        mail,
        pass
      };
      insertUser(user.mail, user.pass);
      setSignIn(initialSignInState);
      setLogged("true");
    }

    // setlogged(true);
    getUsers().then(user => setUsers(user));
    // console.log("user response:", user);
    console.log("sdfd");
  };

  const handleChangeLogIn = e => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;
    setLoggin({ ...logIn, [name]: value });
  };

  const handleChangeSignIn = e => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;
    setSignIn({ ...signIn, [name]: value });
  };

  //Cambia el estado de las tareas del host
  const changeTaskStatus = async task => {
    console.log(tasks);
    await isDoneTask(task.id).then(() =>
      getTasks().then(tasks => setTasks(tasks))
    );
  };

  //Inserta una nueva tarea
  const handleClickAddTask = async task => {
    setForm(initialFormState);
    setModalData(initialFormState);
    setIsModalOpened(true);
  };

  //Edita una tarea
  const editTask = async task => {
    setForm(task);
    setModalData(form);
    setIsModalOpened(true);
  };

  //Elimina una tarea
  const onDeleteOneTask = async task => {
    console.log("id", task.id);
    await deleteTask(task.id).then(() =>
      getTasks().then(tasks => setTasks(tasks))
    );
  };

  const addMyTask = async task => {
    getTasksUsers().then(data => setTasksUsers(data));
    // const a = tasksUsers.map(b => {
    //   console.log(b.idTask);
    //   console.log(task.id);
    //   if (b.idTask === task.id) {
    //     alert("la tarea ya esta");
    //   } else {

    await insertTaskUser(task.id, userDB.id)
      .then(() => getTasksUsers().then(data => setTasksUsers(data)))
      .catch(err => alert("Imposible realizar la conección"));
    alert("Tarea Vinculada");
  };

  const deleteMyTask = async task => {
    getTasksUsers().then(data => setTasksUsers(data));
    console.log("data", users);
    const map = tasksUsers.map(b => {
      if (task.id === b.idTask) {
        getTasksUsers().then(deleteTaskUser(task.id));
        alert("Tarea desvinculada");
        console.log("tasdad", tasksUsers);
      }
    });
  };

  if (logged === "true") {
    return (
      <>
        <div className="container">
          <Nav logged={setLogged} user={userDB} />
          <CustomModal
            isActive={isModalOpened}
            title={form.id ?? form.id > 0 ? "Editar tarea" : "Nuevo tarea"}
            handleClose={() => setIsModalOpened(false)}
          >
            <Form onSubmit={handleSubmit} onChange={handleChange} form={form} />
          </CustomModal>

          <div className="row mt-3">
            <div className="col">
              <h2>Tareas</h2>
            </div>
            <div className="col">
              <button
                className="btn btn-primary float-right"
                onClick={handleClickAddTask}
              >
                Nueva
              </button>
            </div>
            <div className="col">
              <button
                className="btn btn-primary float-right"
                onClick={handleClick}
              >
                ALL
              </button>
            </div>
          </div>

          <div className="row mt-3">
            <ListsContainer
              tasks={tasks}
              editTask={editTask}
              changeTaskStatus={changeTaskStatus}
              onDeleteOneTask={onDeleteOneTask}
              addMyTask={addMyTask}
              deleteMyTask={deleteMyTask}
            />
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <SignIn
          onChange={handleChangeSignIn}
          onSubmit={handleSubmitSignIn}
          signIn={signIn}
        />
        <Login
          onSubmit={handleSubmitLogin}
          onChange={handleChangeLogIn}
          logIn={logIn}
        />
      </>
    );
  }
};

export default App;
