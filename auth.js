// Tài khoản mẫu
const sampleAccounts = {
    teachers: [
        {
            email: "nguyenhuuvan@gmail.com",
            password: "teacher123",
            name: "Nguyễn Hữu Văn",
            role: "teacher",
            teacherId: "GV001"
        },
        {
            email: "phamthibich@gmail.com",
            password: "bichteacher2024",
            name: "Phạm Thị Bích",
            role: "teacher",
            teacherId: "GV002"
        },
        {
            email: "tranminhdung@gmail.com",
            password: "teacherpro123",
            name: "Trần Minh Dũng",
            role: "teacher",
            teacherId: "GV003"
        }
    ],
    students: [
        {
            email: "ngocnhi732@gmail.com",
            password: "student123",
            name: "Trần Ngọc Nhi",
            role: "student",
        
        },
        {
            email: "lehoanganh@gmail.com",
            password: "hoanganh2024",
            name: "Lê Hoàng Anh",
            role: "student",

        },
        {
            email: "phamthiyen@gmail.com",
            password: "yenpham123",
            name: "Phạm Thị Yến",
            role: "student",

        }
    ]
};


// Lưu tài khoản mẫu vào localStorage khi trang web được tải
if (!localStorage.getItem('accounts')) {
    localStorage.setItem('accounts', JSON.stringify(sampleAccounts));
}

// Hàm kiểm tra đăng nhập
function authenticate(email, password, role) {
    const accounts = JSON.parse(localStorage.getItem('accounts'));
    const userList = role === 'teacher' ? accounts.teachers : accounts.students;
    
    const user = userList.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
    }
    return false;
}

// Hàm đăng ký
function register(userData, role) {
    const accounts = JSON.parse(localStorage.getItem('accounts'));
    
    // Kiểm tra email đã tồn tại
    const existingTeacher = accounts.teachers.find(t => t.email === userData.email);
    const existingStudent = accounts.students.find(s => s.email === userData.email);
    
    if (existingTeacher || existingStudent) {
        return false;
    }

    if (role === 'teacher') {
        accounts.teachers.push({
            ...userData,
            role: 'teacher'
        });
    } else {
        accounts.students.push({
            ...userData,
            role: 'student'
        });
    }

    localStorage.setItem('accounts', JSON.stringify(accounts));
    return true;
}

// Thêm vào cuối file auth.js
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Hàm kiểm tra trạng thái đăng nhập
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}