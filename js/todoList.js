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
    
    let toastEl = document.getElementById('welcomeToast'); // 取得toast元素
    let toast = new bootstrap.Toast(toastEl); // 初始化toast
    toast.show(); // 顯示歡迎內容

    let isAnimating = false;

    /**
     * 取得用戶的代辦事項。
     * @returns {Promise<Array>} 返回一個承諾(Promise)，它解析(resolve)為用戶的代辦事項。
     */
    function getTodo() {
        // 從 localStorage 中獲取 token
        const token = localStorage.getItem('token');  

        // 發起 GET 請求以從伺服器取得代辦事項
        // 將 token 添加到請求標頭中進行授權
        return axios.get(`${apiUrl}/todos`, {
            headers: {
                'Authorization': token  
            }
        })
        .then(response => {
            // 從響應中取得代辦事項數據
            const userTodos = response.data.todos;  
            console.log(userTodos);

            // 返回數據，以便在後續的 .then 方法中訪問
            return userTodos;  
        })
        .catch(error => {
            // 輸出錯誤信息到控制台
            console.log(error.response);

            // 出錯時返回 null
            return null;  
        });
    }

    // 初始化時調用 getTodo 函數，以確保載入並正確顯示初始的代辦事項數量
    getTodo().then(userTodos => {
        // 如果數據有效
        if (userTodos) {  
            // 更新 todos 變數的值，以便在應用中的其他地方使用
            todos = userTodos;

            // 初始化時，展示所有的待辦事項
            filterTodos('all', todos); 
        }
    });


    

    // 新增待辦事項
    initializeAddTodo();

    // 刪除待辦事項
    initializeDeleteTodo();


    /**
     * 登出用戶並更新UI。
     */
    document.querySelector('.signOut').addEventListener('click', function() {
        // 顯示一個彈出視窗（SweetAlert2），詢問用戶是否真的要登出
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
            // 如果用戶確認要登出
            if (result.isConfirmed) {
                // 調用 signOut 函數
                signOut().then(response => {
                    // 檢查響應狀態碼是否為200（成功）
                    if(response.status === 200) { 
                        // 從 localStorage 移除 token
                        localStorage.removeItem('token');
                        // 通知用戶已成功登出並導向登入頁面
                        Swal.fire(
                            '已登出！',
                            '您已成功登出。',
                            'success'
                        ).then(() => {
                            window.location.href = '../index.html';
                        });
                    }
                }).catch(error => {
                    // 如果在登出過程中出現錯誤，將錯誤信息打印到控制台並通知用戶
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

    /**
     * 發送一個登出請求到伺服器。
     * @returns {Promise} 返回 axios 請求的承諾。
     */
    function signOut() {

        const token = localStorage.getItem('token'); 
        // 發送一個 DELETE 請求到服務器的登出端點，並在請求標頭中包含 token
        return axios.delete(`${apiUrl}/users/sign_out`, {
            headers: {
                'Authorization': token
            }
        });
    }


    // 獲取所有.navTodo 狀態按鈕
    let navTodos = document.querySelectorAll('.navTodo');
    // 添加事件監聽器給每個按鈕
    navTodos.forEach(button => {
        button.addEventListener('click', function() {
            // 獲取按鈕的data-filter屬性值並將其作為過濾類型參數
            let type = this.getAttribute('data-filter');

            // 調用過濾待辦事項函數
            filterTodos(type, todos);

            // 移除所有按鈕的'active'類
            navTodos.forEach(btn => {
                btn.classList.remove('active');
            });

            // 為被點擊的按鈕添加'active'類
            this.classList.add('active');
        });
    });

    /**
     * 過濾待辦事項並更新UI
     * @param {string} type 過濾類型：'all' | 'completed' | 'uncompleted'
     * @param {Array} todos 待辦事項數組
     */
    function filterTodos(type, todos) {
        let filteredTodos;
        currentFilter = type;  // 更新當前過濾狀態
        
        // 根據過濾類型確定要顯示的待辦事項
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
        
        // 渲染過濾後的待辦事項並更新badge
        renderData(filteredTodos);
        updateTodoBadges(todos);
    }

    /**
     * 更新待辦事項的badge值
     * @param {Array} todos 待辦事項數組
     */
    function updateTodoBadges(todos) {
        // 更新每個類別待辦事項的數量
        document.querySelector('.allBadge').textContent = `+${todos.length}`;
        document.querySelector('.doneBadge').textContent = `+${todos.filter(todo => todo.completed_at !== null).length}`;
        document.querySelector('.undoneBadge').textContent = `+${todos.filter(todo => todo.completed_at === null).length}`;
    }


    // 初始化添加待辦事項的功能
    function initializeAddTodo() {
        // 為添加按鈕添加點擊事件監聽器
        addButton.addEventListener('click', handleAddTodo);

        // 監聽輸入框的 Enter 鍵事件
        newitem.addEventListener('keypress', function(e) {
            // 如果按下的是Enter鍵，則呼叫 handleAddTodo
            if (e.key === 'Enter') {
                handleAddTodo();
            }
        });

        function handleAddTodo() {
            // 檢查輸入框是否為空
            if (newitem.value === "") {
                alert("請輸入內容");
                return;
            }
            // 創建新的待辦事項對象並清空輸入框
            const newTodo = { content: newitem.value, completed: false };
            newitem.value = '';
            // 將新的待辦事項發送到伺服器
            addTodoToServer(newTodo);
        }

        function addTodoToServer(newTodo) {
            const token = localStorage.getItem('token');
            // 使用 axios 發送 POST 請求以添加新的待辦事項
            axios.post(`${apiUrl}/todos`, {
                todo: newTodo
            }, {
                headers: {
                    Authorization: token
                }
            })
            .then(response => {
                // 在控制台打印伺服器響應
                console.log(response);

                // 獲取更新後的待辦事項列表
                getTodo().then(userTodos => {
                    // 確保數據有效
                    if (userTodos) {
                        todos = userTodos;  // 更新全局變量 todos
                        // 更新 UI
                        renderData(userTodos);
                        updateTodoBadges(todos);
                        filterTodos(currentFilter, todos); // 重新過濾並渲染待辦事項列表
                    }
                });
            })
            // 在控制台打印任何錯誤的響應
            .catch(error => console.log(error.response));
        }
    }

    // 初始化刪除待辦事項的功能
    function initializeDeleteTodo() {
        // 監聽清單群組的點擊事件
        listGroup.addEventListener('click', function(e) {
            const target = e.target;
            // 確認點擊的元素或其子元素是否有 .trash 類別
            if (target.matches('.trash, .trash *')) {
                e.preventDefault();
                const listItem = target.closest('.list-group-item');
                const todoId = listItem.dataset.todoId; // 獲取待辦事項的 id

                // 添加動畫效果
                listItem.classList.add('animate__animated', 'animate__headShake');
                setTimeout(() => {
                    listItem.classList.remove('animate__headShake');
                    listItem.classList.add('animate__fadeOutLeft');
                }, 400);
                setTimeout(() => {
                    // 在動畫結束後刪除待辦事項
                    deleteTodoFromServer(listItem, todoId);
                }, 1500);
            }
        });

        // 將待辦事項的 id 傳遞給伺服器，並從 DOM 中移除元素
        function deleteTodoFromServer(listItem, todoId) {
            const token = localStorage.getItem('token');
            
            // 使用 axios 向伺服器發送 DELETE 請求以刪除待辦事項
            axios.delete(`${apiUrl}/todos/${todoId}`, {
                headers: {
                    'Authorization': token
                }
            })
            .then(response => {
                console.log(response);
                listItem.remove(); // 從 DOM 中移除 listItem
                // 更新待辦事項列表和 UI
                getTodo().then(userTodos => {
                    if (userTodos) {
                        todos = userTodos; // 更新全局變數 todos
                        // 更新 UI
                        renderData(todos);
                        updateTodoBadges(todos); // 更新徽章
                        filterTodos(currentFilter, todos); // 重新過濾並渲染待辦事項列表
                    }
                });
            })
            .catch(error => console.log(error.response));
        }
    }

    // 渲染數據到 HTML
    function renderData(userTodos) {
        
        if (isAnimating) return; // 若動畫正在運行，則不進行渲染
        // 清空當前列表
        listGroup.innerHTML = '';
        // 複製一份待辦事項數據以進行排序和過濾
        let sortedData = [...userTodos]; 

        // 遍歷數據，渲染到 UI 上
        sortedData.forEach((item) => {
            const listItem = createTodoItemElement(item); // 創建待辦事項元素
            listGroup.appendChild(listItem);
        });
    }

    // 創建待辦事項元素
    function createTodoItemElement(item) {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item py-3 px-4 mb-1 d-flex';
        listItem.dataset.todoId = item.id; 
        listItem.innerHTML = createTodoItemTemplate(item); // 創建待辦事項的 HTML 模板

        const taskNameDiv = listItem.querySelector('.task-name');
        taskNameDiv.setAttribute('contenteditable', 'true');
        initializeEditableTask(taskNameDiv, item, item.id); // 初始化編輯待辦事項的功能

        const checkbox = listItem.querySelector('.form-check-input');
        initializeToggleTodo(checkbox, item, item.id); // 更新完成＆已完成切換

        return listItem;
    }

    // 創建待辦事項的 HTML 模板
    function createTodoItemTemplate(item) {
        return `
            <div class="overflow-auto me-auto">
                <span class="task-name px-2 text-nowrap text-break ${item.completed_at ? 'striked' : ''}">
                    ${item.content}
                </span>
            </div>
            <div class="actions text-nowrap ms-3">
                <input class="form-check-input me-3" type="checkbox" aria-label="..." ${item.completed_at ? 'checked' : ''}>
                <a href="#" class="trash">
                    <i class="fas fa-trash"></i>
                </a>
            </div>
        `;
    }

    // 初始化編輯待辦事項的功能
    function initializeEditableTask(taskElement, item, todoId) {
        taskElement.addEventListener('blur', () => saveEdit());
        taskElement.addEventListener('keypress', (e) => handleKeyPress(e));

        function handleKeyPress(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                taskElement.blur();
            }
        }

        function saveEdit() {
            const updatedContent = taskElement.textContent;
            if (item.content !== updatedContent) {
                item.content = updatedContent;
                updateTodo(updatedContent, todoId);
            }
        }
    }

    // 更新待辦事項內容至伺服器
    function updateTodo(updatedContent, todoId) {
        const token = localStorage.getItem('token');
        axios.put(`${apiUrl}/todos/${todoId}`, {
                "todo": {
                    "content": updatedContent
                }
            }, {
                headers: {
                    'Authorization': token  
                }
            })
            .then(response => console.log(response))
            .catch(error => console.log(error.response));
    }

    // 初始化待辦事項的完成與未完成狀態切換的功能
    function initializeToggleTodo(checkbox, item, todoId) {
        checkbox.addEventListener('change', function () {
            const isCompleted = checkbox.checked; // 取得 checkbox 的選中狀態
            // 更新待辦事項的完成狀態
            updateTodoStatus(todoId, isCompleted) 
                .then(() => {
                    // 根據完成狀態，設定或取消待辦事項的完成時間
                    item.completed_at = isCompleted ? new Date().toISOString() : null;
                    // 更新用戶界面來反映新的待辦事項狀態
                    updateUI(item, checkbox);
                    filterTodos(currentFilter, todos);// 確保在更新狀態後重新過濾待辦事項列表
                    updateTodoBadges(todos);// 確保在更新狀態後更新徽章
                })
                .catch(error => console.log(error));
        });
    }

    // 通過 API 向伺服器更新待辦事項的完成狀態
    function updateTodoStatus(todoId, isCompleted) {
        // 從 localStorage 中取得 token
        const token = localStorage.getItem('token');
        // 建立一個物件來存放更新的狀態
        const statusUpdate = {
            todo: {
                completed: isCompleted
            }
        };

        // 發送 patch 請求以更新待辦事項的狀態
        return axios.patch(`${apiUrl}/todos/${todoId}/toggle`, statusUpdate, {
            headers: {
                'Authorization': token  // 添加 token 至請求頭
            }
        });
    }

    // 更新 UI 以反映待辦事項的新狀態
    function updateUI(item, checkbox) {
        // 從 checkbox 找到最接近的待辦事項項目元素
        const listItem = checkbox.closest('.list-group-item');
        // 選擇待辦事項名稱的元素
        const taskName = listItem.querySelector('.task-name');
        // 根據待辦事項的完成時間，設定或移除相應的 CSS 類別
        if(item.completed_at !== null) {
            taskName.classList.add('striked');
            taskName.classList.remove('unstriked');
        } else {
            taskName.classList.add('unstriked');
            taskName.classList.remove('striked');
        }
    }

});
