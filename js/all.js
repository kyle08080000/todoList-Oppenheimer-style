document.addEventListener('DOMContentLoaded', function() {
    const listGroup = document.querySelector('.list-group');
    const newitem = document.querySelector(".newitem");
    const addButton = document.querySelector(".addButton");
    const sortCheckbox = document.getElementById('flexSwitchCheckDefault');
    const clearButton = document.querySelector('.clear');
    const pendingCountElement = document.querySelector('.pending-count');
    const myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
    const toast = new bootstrap.Toast(document.getElementById('liveToast'));
    const toastBody = document.querySelector('.toast-body');

    let data = [
        { 
            category: "全部",
            todos: [
                { content: "來杯咖啡", completed: false},
                { content: "記得回 Steven 訊息", completed: false},
                { content: "email 退款回信", completed: false}
            ]
        }
    ];

    document.querySelector('.nav-tabs .Category').textContent = '全部';
    let isAnimating = false;

    // 新增代辦類別 分類模組
    initializeCategoryModule();

    // 卡片導航欄
    initializeCardNav();

    // 新增待辦事項
    initializeAddTodo();

    // 刪除待辦事項
    initializeDeleteTodo();

    // 排序已完成項目
    initializeSortCompleted();

    // 清除所有已完成的任務
    initializeClearCompleted();

    // 初始化時調用一次，以確保正確顯示初始任務數量
    renderData();




    // 初始化分類模組
    function initializeCategoryModule() {

        // 當按下 liveToastBtn 按鈕時，執行以下功能
        document.getElementById('liveToastBtn').addEventListener('click', function() {
            const categoryInput = document.querySelector('.new-category');
            const category = categoryInput.value;

            // 如果 category 不為空，執行以下功能
            if (category !== "") {
                // 創建新的 li 元素，設定它的 class 和 innerHTML，並加入到 navbar-nav 中
                const newLi = document.createElement("li");
                newLi.className = "nav-item";
                newLi.innerHTML = `<a class="bar-nav-link nav-link fw-bold text-break" href="#">${category}</a>`;
                document.querySelector('.navbar-nav').appendChild(newLi);

                // 創建新的 li 元素，設定它的 innerHTML，並加入到 category-menu 中
                const newOption = document.createElement("li");
                newOption.innerHTML = `<a class="dropdown-item text-truncate" href="#">${category}</a>`;
                document.querySelector('.category-menu').appendChild(newOption);

                // 將新類別加入到 data 陣列
                data.push({ category: category, todos: [] });
                console.log(data);

                // 設定 toastBody 的文字內容，並顯示 toast
                toastBody.textContent = `「${category}」 已新增至右上角選單！`;
                toast.show();

                // 隱藏 myModal
                myModal.hide();

                // 清空 category 輸入框
                categoryInput.value = '';

                // 為新創建的 navLink 添加事件監聽器
                const newLiNavLink = newLi.querySelector('.bar-nav-link.nav-link'); //漢堡選單
                newLiNavLink.addEventListener('click', function(event) {
                    const clickedCategory = event.target.textContent.trim();
                    const allCategoryTab = document.querySelector('.Category');
                    allCategoryTab.textContent = clickedCategory; //依照漢版選單點擊的分類 顯示在卡片導航
                    renderData();
                });
            }
        });

        // 為所有的 btn-close 和 btn-secondary 元素添加點擊事件，當點擊時隱藏 myModal
        document.querySelectorAll('.btn-close, .btn-secondary').forEach(function(element){
            element.addEventListener('click', function(){
                myModal.hide();
            });
        });

        // 為 navbar-nav 中的所有 nav-link 添加點擊事件，當點擊時執行以下功能
        document.querySelectorAll('.navbar-nav .nav-link').forEach(function(navLink) {
            navLink.addEventListener('click', function(event) {
                const clickedCategory = event.target.textContent.trim();
                const allCategoryTab = document.querySelector('.nav.nav-tabs .Category');
                allCategoryTab.textContent = clickedCategory; //更換卡片Category分類名稱
                renderData(clickedCategory);

            });


        });

    }


    // 初始化卡片導航欄
    function initializeCardNav() {
        // 當點擊導航連結時觸發的事件處理函數
        function onNavLinkClick(event) {
            event.preventDefault(); // 防止連結的默認行為
            const clickedNavLink = event.target; // 獲取被點擊的導航連結
            document.querySelectorAll('.nav-link').forEach(function(navLink) {
                navLink.classList.remove('active'); // 移除所有導航連結的 'active' 樣式
            });
            clickedNavLink.classList.add('active'); // 為被點擊的導航連結添加 'active' 樣式
            renderData(); // 渲染數據
        }

        // 為每一個導航連結添加點擊事件監聽器
        document.querySelectorAll('.nav-link').forEach(function(navLink) {
            navLink.addEventListener('click', onNavLinkClick);
        });
    }


    // 初始化添加待辦事項的功能
    function initializeAddTodo() {
        // 為添加按鈕添加點擊事件監聽器
        addButton.addEventListener('click', addTodo);

        // 監聽輸入框的 Enter 鍵事件
        newitem.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTodo();
            }
        });
        

        function addTodo() {
            if (newitem.value === "") {
                alert("請輸入內容");
                return;
            }
        
            const dropdownItemName = document.querySelector('.dropdown-item.active'); 
            const selectedCategory = dropdownItemName.textContent.trim();
            const categoryObj = data.find(item => item.category === selectedCategory);
            const allcategory = data.find(item => item.category === "全部");
            
            if (categoryObj && categoryObj!= allcategory) {
                categoryObj.todos.push({ content: newitem.value, completed: false });
                allcategory.todos.push({ content: newitem.value, completed: false }); //都會存到全部裡面
            } else {
                allcategory.todos.push({ content: newitem.value, completed: false }); //都會存到全部裡面
            }

        
            newitem.value = '';
            renderData();
            console.log(data);
        }
        

        // 分類下拉 選單點擊事件
        document.querySelector('.category-menu').addEventListener('click', function(e) {
            const clickedItem = e.target;
            if (clickedItem.matches('.dropdown-item')) {
                e.preventDefault();
                document.querySelector('.category-menu .dropdown-item.active').classList.remove('active');
                clickedItem.classList.add('active');
                const selectedCategory = clickedItem.textContent.trim();
                // ... do something with selectedCategory, e.g., update the todos list


                const popoverBtn = document.querySelector('.popover-btn');
                const dropdownModal = document.querySelector('.dropdown-modal');
                // 顯示一個彈出提示框
                if(clickedItem != dropdownModal){
                    var popover = new bootstrap.Popover(popoverBtn, {
                        html: true,
                        title: '<i class="fas fa-radiation-alt"></i> 警告！',
                        content: '分類到：「' + selectedCategory + '」'
                    });
                    popover.show();
    
                    // 6 秒後隱藏彈出提示框
                    setTimeout(function() {
                        popover.hide();
                    }, 3000);
                }
            }
        });
        
    }


    // 初始化刪除待辦事項的功能
    function initializeDeleteTodo() {
        listGroup.addEventListener('click', function(e) {
            const target = e.target;
            if (target.matches('.trash, .trash *')) {
                e.preventDefault();
                const listItem = target.closest('li');
                const index = [...listGroup.children].indexOf(listItem);
                const selectedCategory = document.querySelector('.nav-link.active').textContent.trim();
                const categoryObj = data.find(item => item.category === selectedCategory);
                listItem.classList.add('animate__animated', 'animate__headShake');
                setTimeout(() => {
                    listItem.classList.remove('animate__flash');
                    listItem.classList.add('animate__fadeOutLeft');
                }, 400);
                setTimeout(() => {
                    isAnimating = false;
                    toggleButtons(false);
                    categoryObj.todos.splice(index, 1);
                    renderData();
                }, 1500);
                isAnimating = true;
                toggleButtons(true);
            }
        });
    }
    

    // 排序已完成項目
    function initializeSortCompleted() {
        // ... 這裡的代碼負責處理排序已完成項目的功能
        sortCheckbox.addEventListener('change', function(e) {
            renderData();
        });
    }

    // 清除所有已完成的任務
    function initializeClearCompleted() {
        // ... 這裡的代碼負責處理清除所有已完成的任務的功能
        // 初始化clearButton的顏色
        clearButton.style.color = "gray";
        // 更新clearButton的顏色
        listGroup.addEventListener('click', function() {
            const completedItems = Array.from(listGroup.children).filter(listItem =>
                listItem.querySelector('input').checked
            );
            clearButton.style.color = completedItems.length === 0 ? "gray" : "#D15628";
        });
        // 清除所有已完成的任務
        clearButton.addEventListener('click', function(e) {
            e.preventDefault();
            toggleButtons(true);
            const completedItems = Array.from(listGroup.children).filter(listItem =>
                listItem.querySelector('.form-check-input').checked
            );
            if (completedItems.length === 0) return;
            completedItems.forEach(listItem => {
                listItem.classList.add('animate__animated', 'animate__flash');
            });
            setTimeout(() => {
                completedItems.forEach(listItem => {
                    listItem.classList.remove('animate__flash');
                    listItem.classList.add('animate__zoomOutUp');
                });
            }, 1000);
            setTimeout(() => {
                isAnimating = false;
                toggleButtons(false);
                data.forEach(category => {
                    category.todos = category.todos.filter(todo => !todo.completed);
                });
                renderData();
            }, 2300); // 1s for 第一個動畫 + 1.5s for 第二個動畫

            // completedItems[completedItems.length - 1].addEventListener('animationend', () => {
            //     isAnimating = false;
            //     toggleButtons(false);
            //     data.forEach(category => {
            //         category.todos = category.todos.filter(todo => !todo.completed);
            //     });
            //     renderData();
            // });
        });
        
        // clearButton.addEventListener('click', function(e) {
        //     e.preventDefault();
        //     const completedItems = Array.from(listGroup.children).filter(listItem =>
        //         listItem.querySelector('.form-check-input').checked
        //     );
        //     if (completedItems.length === 0) return;
        //     completedItems.forEach(listItem => {
        //         listItem.classList.add('animate__animated', 'animate__flash');
        //     });

        //     isAnimating = true;
        //     toggleButtons(true);
        //     completedItems[completedItems.length - 1].addEventListener('animationend', () => {
        //         isAnimating = false;
        //         toggleButtons(false);
        //         data.forEach(category => {
        //             category.todos = category.todos.filter(todo => !todo.completed);
        //         });
        //         renderData();
        //     });
        // });
    }

    // 渲染数据到 HTML
    function renderData() {
        // 檢查是否有動畫正在運行
        if (isAnimating) return;
        // 清除當前列表
        listGroup.innerHTML = '';
        // 獲取當前選定的類別
        const cardNav = document.querySelector('.nav.nav-tabs'); //卡片導航欄
        const selectedCategory = document.querySelector('.nav-link.active').textContent.trim(); //已完成 & 未完成
        const navTabsCategory = document.querySelector('.Category').textContent; //卡片當前分類名稱
        // document.querySelector('.Category').textContent = navTabsCategory;

        let sortedData = [];

        // 找到選定類別的數據
        const categoryObj = data.find(item => item.category === navTabsCategory);
        sortedData = sortedData.concat([...categoryObj.todos]);
        

        // 檢查選定的類別是否為 '已完成' 或 '未完成' 
        if (selectedCategory === '已完成') {
            sortedData = categoryObj.todos.filter(item => item.completed);
        } else if (selectedCategory === '未完成') {
            sortedData = categoryObj.todos.filter(item => !item.completed);
        } else {
            sortedData = [...categoryObj.todos];
        }

        // 根據選定的排序方式對數據進行排序
        sortedData.sort((a, b) => {
            if (sortCheckbox.checked) {
                return a.completed - b.completed;
            }
            return sortedData.indexOf(a) - sortedData.indexOf(b);
        });


        sortedData.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item py-3 px-4 mb-1 d-flex';
            listItem.innerHTML = `
                <div class="overflow-auto me-auto">
                    <span class="task-name px-2 text-nowrap text-break ${item.completed ? 'striked' : ''}">${item.content}</span>
                </div>
                <div class="actions text-nowrap ms-3">
                    <input class="form-check-input me-3" type="checkbox" aria-label="..." ${item.completed ? 'checked' : ''}>
                    <a href="#" class="trash">
                        <i class="fas fa-trash"></i>
                    </a>
                </div>
            `;
            const checkbox = listItem.querySelector('.form-check-input');
            // 監聽 checkbox 的變化
            checkbox.addEventListener('change', function() {
                item.completed = checkbox.checked;
                if (sortCheckbox.checked) {
                    renderData();
                } else {
                    const taskName = listItem.querySelector('.task-name');
                    taskName.classList.toggle('striked', item.completed);
                    updatePendingCount();
                }
            });
            listGroup.appendChild(listItem);
        });
        updatePendingCount(); // 更新待完成任务数量
    }

    // 更新待完成任务数量
    function updatePendingCount() {
        const navTabsCategory = document.querySelector('.Category').textContent;
        const selectedCategory = document.querySelector('.nav-link.active').textContent.trim();
        const categoryObj = data.find(item => item.category === navTabsCategory);
        let todos = categoryObj.todos;

        if (selectedCategory === '已完成' || selectedCategory === '未完成') {
            const completed = selectedCategory === '已完成';
            todos = todos.filter(item => item.completed === completed);
        }

        const pendingCount = todos.filter(item => !item.completed).length;
        pendingCountElement.textContent = selectedCategory === '已完成' ? '已完成 ' + (todos.length - pendingCount) + ' 個' : '待完成 ' + pendingCount + ' 個';
    }



    // 檢查畫面是否有動畫正在執行
    function toggleButtons(disabled) {
        // ... 這裡的代碼負責處理檢查畫面是否有動畫正在執行的功能
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
