const apiUrl = `https://todoo.5xcamp.us`;
let token = axios.defaults.headers.common['Authorization'];
// 存儲 token 到 localStorage
localStorage.setItem('token', token);

// 初始化
document.addEventListener('DOMContentLoaded', (event) => {
    
    // 表單驗證
    var forms = document.querySelectorAll('.needs-validation');

    Array.prototype.slice.call(forms).forEach((form) => {
        // 为每个输入元素添加 input 事件监听器
        Array.from(form.elements).forEach((input) => {
            input.addEventListener('input', () => {
                const password = form.password.value;
                const confirmPassword = form.confirmPassword.value;

                // 检查密码和确认密码是否匹配
                if (password !== confirmPassword) {
                    form.confirmPassword.setCustomValidity('密码和确认密码不匹配');
                } else {
                    form.confirmPassword.setCustomValidity('');
                }

                // 为表单中的每个输入元素触发验证
                form.classList.add('was-validated');
            });
        });

        // 表单提交事件处理函数
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const email = form.email.value;
            const nickname = form.username.value;
            const password = form.password.value;

            if (form.checkValidity()) {
                signUp(email, nickname, password)
            } else {
                form.classList.add('was-validated');  // 如果验证失败，触发验证
            }
        }, false);
    });
});


// 註冊帳號
async function signUp(email,nickname,password){
    try {
        const response = await axios.post(`${apiUrl}/users`,{
            "user": {
                "email": email,
                "nickname": nickname,
                "password": password
            }
        });
        Swal.fire({
            icon: 'success',
            title: '註冊成功',
            text: '請妥善保管您的帳號！',
            confirmButtonColor: '#6E1610',
            allowOutsideClick: false,  // 阻止用户通过点击外部来关闭Swal对话框
            confirmButtonText: '開始使用！',
            preConfirm: async () => {
                try {
                    await logIn(email, password);
                    window.location.href = 'todoList.html';  // 登入成功后跳转到todolist.html
                } catch (error) {
                    Swal.showValidationMessage(`登入失败: ${error.message}`);
                }
            }
        });
    } catch(error) {
        if (error.response && error.response.status === 422) {
            // Handle 422 error
            Swal.fire({
                icon: 'error',
                title: '註冊失敗',
                text: '重复的电子邮件地址.'
            });
        } else {
            // Handle other errors
            Swal.fire({
                icon: 'error',
                title: '發生錯誤',
                text: error.message
            });
        }
    }
}

// 登入帳戶
async function logIn(email,password){
    try{
        const response = await axios.post(`${apiUrl}/users/sign_in`,{
            "user": {
                "email": email,
                "password": password
            }
        });
        axios.defaults.headers.common['Authorization'] = response.headers.authorization;
        localStorage.setItem('token', response.headers.authorization);  // 更新 localStorage
    } catch(error) {
        Swal.showValidationMessage(`登入失败: ${error.message}`);
    }
}


// 更換密码眼睛图标的 樣式
function togglePasswordVisibility(inputId) {
    const inputElement = document.getElementById(inputId);
    const eyeIconElement = document.getElementById(`eyeIcon${inputId}`);
    if (inputElement.type === "password") {
        inputElement.type = "text";
        eyeIconElement.classList.remove('fa-eye-slash');
        eyeIconElement.classList.add('fa-eye');
    } else {
        inputElement.type = "password";
        eyeIconElement.classList.remove('fa-eye');
        eyeIconElement.classList.add('fa-eye-slash');
    }
    setPositionOfEyeIcon(inputId);  // 这里调用设置位置的函数
}

function toggleEyeIcon(inputId) {
    const inputElement = document.getElementById(inputId);
    const eyeIconElement = document.getElementById(`eyeIcon${inputId}`);
    if (inputElement.value) {
        eyeIconElement.style.visibility = 'visible';
    } else {
        eyeIconElement.style.visibility = 'hidden';
    }
    setPositionOfEyeIcon(inputId);  // 这里调用设置位置的函数
}

// 设置密码眼睛图标的 位置
function setPositionOfEyeIcon(inputId) {
    const formFloatingElement = document.querySelector(`.form-floating.confirm-password`);
    const eyeIconElement = document.getElementById(`eyeIcon${inputId}`);
    const formFloatingHeight = formFloatingElement.offsetHeight;

    // 设置眼睛图标的新位置以使其保持在垂直中心
    const newTopPosition = formFloatingHeight / 2 - eyeIconElement.offsetHeight / 2;
    eyeIconElement.style.top = `${newTopPosition}px`;
}

setPositionOfEyeIcon('floatingPassword');  // 设置“密码”字段的眼睛图标位置
setPositionOfEyeIcon('floatingConfirmPassword');  // 设置“确认密码”字段的眼睛图标位置