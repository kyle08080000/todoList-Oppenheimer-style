const apiUrl = `https://todoo.5xcamp.us`;

// 防止登出用戶按上一頁返回
window.onload = function() {
    const token = localStorage.getItem('token');  
    
    if (!token) {
        Swal.fire({
            icon: 'error',
            title: '連線已過期',
            text: '請重新登入',
            confirmButtonText: '確定',
            allowOutsideClick: false,
            backdrop: 'rgba(0,0,0,1)'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '../index.html';
            }
        });
    }
    // 從 localStorage 中獲取 username
    const username = localStorage.getItem('username');
    if(username) {
        WelcomeMessage(username);// 更新歡迎訊息
    }
}
// 歡迎訊息的函數
function WelcomeMessage(username) {
    let toastBody = document.querySelector('.toast-body');
    
    if (toastBody) {
        toastBody.textContent = `歡迎加入, ${username}！`;
        // 在這裡你可能還想要顯示 toast，如果它不是自動顯示的
        var toastEl = document.getElementById('welcomeToast');
        var toast = new bootstrap.Toast(toastEl);
        toast.show();
    } else {
        console.error("Toast body not found!");
    }
}


document.addEventListener('DOMContentLoaded', function() {
    const listGroup = document.querySelector('.list-group');
    const newitem = document.querySelector(".newitem");
    const addButton = document.querySelector(".addButton");
    const sortCheckbox = document.getElementById('flexSwitchCheckDefault');
    const clearButton = document.querySelector('.clear');
    const pendingCountElement = document.querySelector('.pending-count');
    
    let toastEl = document.getElementById('welcomeToast'); // 取得toast元素
    let toast = new bootstrap.Toast(toastEl); // 初始化toast
    
    toast.show();

    // 取得代辦
    function getTodo() {
        const token = localStorage.getItem('token');  // 从 localStorage 获取 token
    
        // 这里返回了 axios.get 的 Promise
        return axios.get(`${apiUrl}/todos`, {
            headers: {
                'Authorization': token  // 将 token 添加到请求头中
            }
        })
        .then(response => {
            const userTodos = response.data.todos;  // 获取响应数据
            console.log(userTodos);
            return userTodos;  // 返回 userTodos 以便于在 then 方法中访问
        })
        .catch(error => {
            console.log(error.response);
            return null;  // 在出错时返回 null
        });
    }
    // 初始化時調用一次，以確保正確顯示初始任務數量
    getTodo().then(userTodos => {
        if (userTodos) {  // 确保数据有效
            // renderData(userTodos);  // 将数据传递给 renderData 函数
            todos = userTodos; // 保存到 todos 變數中
            filterTodos('all',todos); // 初始化時展示所有待辦事項
        }
    });

    // document.querySelector('.nav-tabs .Category').textContent = '全部';
    let isAnimating = false;

    // 新增待辦事項
    initializeAddTodo();

    // 刪除待辦事項
    initializeDeleteTodo();

    // 清除所有已完成的任務
    // initializeClearCompleted();

    // 初始化時調用一次，以確保正確顯示初始任務數量
    // renderData();


    // 登出
    document.querySelector('.signOut').addEventListener('click', function() {
        Swal.fire({
            title: '您確定要登出嗎？',
            text: "您可以在任何時候重新登入！",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '是的，登出！',
            cancelButtonText: '取消'
        }).then((result) => {
            // 如果用戶點擊了「是的，登出！」按鈕
            if (result.isConfirmed) {
                // 呼叫 signOut 函數，並在成功登出後處理用戶的UI更新
                signOut().then(response => {
                    if(response.status === 200) { 
                        localStorage.removeItem('token');
                        Swal.fire(
                            '已登出！',
                            '您已成功登出。',
                            'success'
                        ).then(() => {
                            window.location.href = '../index.html';
                        });
                    }
                }).catch(error => {
                    console.error('登出過程中發生錯誤', error);
                    Swal.fire(
                        '錯誤！',
                        '登出過程中發生錯誤。',
                        'error'
                    );
                });
            }
        });
    });
    
    function signOut() {
        const token = localStorage.getItem('token'); 
        return axios.delete(`${apiUrl}/users/sign_out`, {
            headers: {
                'Authorization': token
            }
        });
    }


    let navTodos = document.querySelectorAll('.navTodo');  // 選擇所有的 .navTodo 按鈕

    navTodos.forEach(button => {
        button.addEventListener('click', function() {
            // 在這裡獲取 data-filter 屬性值，並將其作為參數傳遞給 filterTodos 函數
            let type = this.getAttribute('data-filter');
            filterTodos(type, todos);  // 假設 todos 是一個已定義並包含待辦事項的變量

            // 移除所有按钮的 active 类
            navTodos.forEach(btn => {
                btn.classList.remove('active');
            });

            // 给被点击的按钮添加 active 类
            this.classList.add('active');
        });
    });
    // 過濾待辦事項的函數
    function filterTodos(type,todos) {
        let filteredTodos;
        currentFilter = type;  // 更新当前的过滤状态
        
        switch(type) {
            case 'all':
                filteredTodos = todos;
                break;
            case 'completed':
                filteredTodos = todos.filter(todo => todo.completed_at !== null);
                break;
            case 'uncompleted':
                filteredTodos = todos.filter(todo => todo.completed_at === null);
                break;
        }
        
        renderData(filteredTodos);// 已经将过滤后的待办事项传递给 renderData 函数
        // 你可能還需要更新待辦事項數量的 badge
        updateTodoBadges(todos);
    }
    function updateTodoBadges(todos) {
        document.querySelector('.allBadge').textContent = `+${todos.length}`;
        document.querySelector('.doneBadge').textContent = `+${todos.filter(todo => todo.completed_at !== null).length}`;
        document.querySelector('.undoneBadge').textContent = `+${todos.filter(todo => todo.completed_at === null).length}`;
    }
    



    // 初始化添加待办事项的功能
    function initializeAddTodo() {
        // 为添加按钮添加点击事件监听器
        addButton.addEventListener('click', handleAddTodo);

        // 监听输入框的 Enter 键事件
        newitem.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleAddTodo();
            }
        });

        function handleAddTodo() {
            if (newitem.value === "") {
                alert("请输入内容");
                return;
            }

            const newTodo = { content: newitem.value, completed: false };
            newitem.value = '';  // 清空输入框

            addTodoToServer(newTodo);  // 将新代办事项发送到服务器
        }

        function addTodoToServer(newTodo) {
            const token = localStorage.getItem('token');  // 获取 token
        
            axios.post(`${apiUrl}/todos`, {
                todo: newTodo
            }, {
                headers: {
                    Authorization: token
                }
            })
            .then(response => {
                console.log(response)
                getTodo().then(userTodos => {
                    if (userTodos) {  // 确保数据有效
                        todos = userTodos;  // <<< 更新全局 todos 变量
                        renderData(userTodos);  // 将数据传递给 renderData 函数
                        updateTodoBadges(todos); // 更新徽章
                    }
                });
            })
            .catch(error => console.log(error.response));
        }
    }


    // 初始化刪除待辦事項的功能
    function initializeDeleteTodo() {
        listGroup.addEventListener('click', function(e) {
            const target = e.target;
            if (target.matches('.trash, .trash *')) {
                e.preventDefault();
                const listItem = target.closest('.list-group-item');
                const todoId = listItem.dataset.todoId;  // 获取待办事项的id
    
                listItem.classList.add('animate__animated', 'animate__headShake');
                setTimeout(() => {
                    listItem.classList.remove('animate__headShake');
                    listItem.classList.add('animate__fadeOutLeft');
                }, 400);
                setTimeout(() => {
                    deleteTodoFromServer(listItem, todoId);  // 将id传递给後端 api
                }, 1500);
            }
        });

        // 将待办事项的id传递给服务器，並且從 DOM 中移除元素
        function deleteTodoFromServer(listItem, todoId) {
            const token = localStorage.getItem('token');  // 获取 token
        
            axios.delete(`${apiUrl}/todos/${todoId}`, {
                headers: {
                    'Authorization': token  // 将 token 添加到请求头中
                }
            })
            .then(response => {
                console.log(response)
                listItem.remove()  // 从 DOM 中移除 listItem
                getTodo().then(userTodos => {
                    if (userTodos) {
                        todos = userTodos;  // 更新全局 todos 变量
                        renderData(todos);  // 重新渲染 UI
                        updateTodoBadges(todos); // 更新徽章
                    }
                });
            })
            .catch(error => console.log(error.response));
        }
    }
    

    // 清除所有已完成的任務
    function initializeClearCompleted() {
        // 初始化clearButton的顏色
        clearButton.style.color = "gray";
        // 點擊勾選匡時 更新clearButton的顏色
        listGroup.addEventListener('click', function() {
            const completedItems = Array.from(listGroup.children).filter(listItem =>
                listItem.querySelector('input').checked
            );
            clearButton.style.color = completedItems.length === 0 ? "gray" : "#D15628";
        });
        // 清除所有已完成的任務
        clearButton.addEventListener('click', function(e) {
            e.preventDefault();  // 防止默認行為
            toggleButtons(true);  // 暫時禁止其他按鈕功能 因為有動畫要執行了
            const completedItems = Array.from(listGroup.children).filter(
                listItem => listItem.querySelector('.form-check-input').checked
            ); // 找已勾選的項目
            if (completedItems.length === 0) return;  // 如果沒有已完成的項目，則返回
            completedItems.forEach(listItem => {  // 為每個已完成的項目添加動畫類
                listItem.classList.add('animate__animated', 'animate__flash');
            });
            setTimeout(() => {  // 設置一個定時器
                completedItems.forEach(listItem => {
                    listItem.classList.remove('animate__flash');  // 移除動畫類
                    listItem.classList.add('animate__zoomOutUp');  // 添加動畫類
                });
            }, 1000);
            setTimeout(() => {  // 設置一個定時器
                isAnimating = false;  // 設置isAnimating為false
                toggleButtons(false);  // 切換按鈕
                data.forEach(category => {  // 為數據的每個類別移除已完成的項目
                    category.todos = category.todos.filter(todo => !todo.completed);
                });
                renderData();  // 渲染數據
            }, 2300); // 1s for 第一個動畫 + 1.5s for 第二個動畫
        });
    }


    // 渲染数据到 HTML
    function renderData(userTodos) {
        // 檢查是否有動畫正在運行
        if (isAnimating) return;
        // 清除當前列表
        listGroup.innerHTML = '';

        // 根据传递的 todos 数据更新排序和过滤逻辑
        let sortedData = [...userTodos]; // 拷貝新的數組

        // 將整理好的資料渲染在畫面上
        sortedData.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item py-3 px-4 mb-1 d-flex';
            listItem.dataset.todoId = item.id;  // 取得每个待办事项的唯一id
            listItem.innerHTML = `
                <div class="overflow-auto me-auto">
                    <span class="task-name px-2 text-nowrap text-break ${item.completed_at ? 'striked' : ''}">${item.content}</span>
                </div>
                <div class="actions text-nowrap ms-3">
                    <input class="form-check-input me-3" type="checkbox" aria-label="..." ${item.completed_at ? 'checked' : ''}>
                    <a href="#" class="trash">
                        <i class="fas fa-trash"></i>
                    </a>
                </div>
            `;
            

            // 編輯代辦式樣內容
            const taskNameDiv = listItem.querySelector('.task-name');
            taskNameDiv.setAttribute('contenteditable', 'true'); //有属性，用户才能编辑它。
            initializeEditableTask(taskNameDiv, item, item.id);
            

            // 监听 checkbox 的变化
            const checkbox = listItem.querySelector('.form-check-input');
            initializeToggleTodo(checkbox, item, item.id);  // 假設 item.id 是 todoId
            listGroup.appendChild(listItem);
        });
        // updatePendingCount(); // 更新待完成任务数量
    }

    // 編輯代辦 內容在 renderData 被調用
    function initializeEditableTask(taskElement, item, todoId) {
        taskElement.addEventListener('blur', function() {
            saveEdit();
        });
    
        taskElement.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();  // 防止 Enter 键的默认行为（例如，提交表单）
                taskElement.blur();  // 触发 blur 事件来保存编辑
            }
        });
        // 編輯保存
        function saveEdit() {
            const updatedContent = taskElement.textContent;
            if (item.content !== updatedContent) {
                item.content = updatedContent;
                // 发送更新到后端 API
                updateTodo(updatedContent, todoId);
            }
        }
    
        function updateTodo(updatedContent,todoId){
            const token = localStorage.getItem('token');  // 从 localStorage 获取 token
    
            axios.put(`${apiUrl}/todos/${todoId}`,{
                "todo": {
                    "content": updatedContent
                }
            },{
            headers: {
                'Authorization': token  // 将 token 添加到请求头中
            }
        })
            .then(response=>console.log(response))
            .catch(error=>console.log(error.response))
        }
    }
    
    // 更新完成＆已完成切換
    function initializeToggleTodo(checkbox, item, todoId) {
        checkbox.addEventListener('change', function () {
            const isCompleted = checkbox.checked;
            // 更新待辦事項的完成狀態
            updateTodoStatus(todoId, isCompleted) // 通過API向服務器更新待辦事項的完成狀態
                .then(() => {
                    // 更新待辦事項的完成時間
                    item.completed_at = isCompleted ? new Date().toISOString() : null;
                    // 更新用戶界面
                    updateUI(item, checkbox); // 更新用戶界面以反映待辦事項的新狀態
                    filterTodos(currentFilter, todos);  // 确保在更新状态后重新过滤待办事项
                    updateTodoBadges(todos);  // 确保在更新状态后更新徽章
                })
                .catch(error => console.log(error));  // 處理任何錯誤
        });
    }
    // 通過API向服務器更新待辦事項的完成狀態
    function updateTodoStatus(todoId, isCompleted) {
        const token = localStorage.getItem('token');  // 從 localStorage 獲取 token
        const statusUpdate = {
            todo: {
                completed: isCompleted
            }
        };

        return axios.patch(`${apiUrl}/todos/${todoId}/toggle`, statusUpdate, {
            headers: {
                'Authorization': token  // 將 token 添加到請求頭中
            }
        });
    }

    // 更新用户界面以反映待办事项的新状态。只更新被改变的待办项目，较好的效能、代码结构、用户体验。
    function updateUI(item, checkbox) {
        const listItem = checkbox.closest('.list-group-item');
        const taskName = listItem.querySelector('.task-name');
        if(item.completed_at !== null) {
            taskName.classList.add('striked');
            if(taskName.classList.contains('unstriked')) {
                taskName.classList.remove('unstriked');
            }
        } else if(taskName.classList.contains('striked')) {
            taskName.classList.add('unstriked');
            taskName.classList.remove('striked');
        }
        // 如果后期需要，可以在这里调用 renderData 以重新排序和重新渲染列表
        // renderData(userTodos);
    }

    
    // 更新待完成任务数量
    function updatePendingCount() {


    }

    // 檢查畫面是否有動畫正在執行
    function toggleButtons(disabled) {
        addButton.disabled = disabled;
        sortCheckbox.disabled = disabled;
        clearButton.disabled = disabled;
        document.querySelectorAll('.form-check-input').forEach(function(checkbox) {
            checkbox.disabled = disabled;
        });
        document.querySelectorAll('.trash').forEach(function(trash) {
            trash.style.pointerEvents = disabled ? 'none' : 'auto';
        });
    }
});
