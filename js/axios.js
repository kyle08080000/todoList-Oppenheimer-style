const apiUrl = `https://todoo.5xcamp.us`;
let token = axios.defaults.headers.common['Authorization'];
// 存儲 token 到 localStorage
localStorage.setItem('token', token);
// Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1MjYzIiwic2NwIjoidXNlciIsImF1ZCI6bnVsbCwiaWF0IjoxNjk1ODczODE2LCJleHAiOjE2OTcxNjk4MTYsImp0aSI6ImU0MGVjMzFhLWM4YTEtNDM0OS04ZTljLWE5N2JhZGM1Nzc1MSJ9.nEat1AD0TO-RqA3IHNmUXJU1Mbv0odM8v6gvARBBgww

function signUp(email,nickname,password){
    axios.post(`${apiUrl}/users`,{
        "user": {
            "email": email,
            "nickname": nickname,
            "password": password
        }
    })
    .then(response=>console.log(response))
    .catch(error=>console.log(error.response))
}
// signUp("adasdasdas44@gmail.com","kyle","weqqweweq123");

function logIn(email,password){
    axios.post(`${apiUrl}/users/sign_in`,{
        "user": {
            "email": email,
            "password": password
        }
    })
    .then(response=>{
        axios.defaults.headers.common['Authorization'] = response.headers.authorization;
        // const token = response.headers.authorization;
        // // 将 token 设置为 axios defaults 和 localStorage
        // axios.defaults.headers.common['Authorization'] = token;
        // localStorage.setItem('token', token);
    })
    .catch(error=>console.log(error.response))
}
logIn("adasdasdas44@gmail.com","weqqweweq123");

function getTodo(){
    axios.get(`${apiUrl}/todos`)
    .then(response=>console.log(response))
    .catch(error=>console.log(error.response))
}

function addTodo(todo){
    axios.post(`${apiUrl}/todos`,{
        "todo": {
            "content": todo
        }
    })
    .then(response=>console.log(response))
    .catch(error=>console.log(error.response))
}

function updateTodo(newTodo,todoId){
    axios.put(`${apiUrl}/todos/${todoId}`,{
        "todo": {
            "content": newTodo
        }
    })
    .then(response=>console.log(response))
    .catch(error=>console.log(error.response))
}

function deleteTodo(todoId){
    axios.delete(`${apiUrl}/todos/${todoId}`)
    .then(response=>console.log(response))
    .catch(error=>console.log(error.response))
}

function toggleTodo(todoId){
    axios.patch(`${apiUrl}/todos/${todoId}/toggle`,{})
    .then(response=>console.log(response))
    .catch(error=>console.log(error.response))
}