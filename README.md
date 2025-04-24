### 📄 `main.ts`
NestJS аппликейшны **эхлэлийн файл** — эндээс `AppModule` ачааллаж, серверийг асаадаг.

---

### 📄 `app.module.ts`
NestJS-ийн үндсэн **root module**. Бүх модулиудыг нэгтгэж энд импортолдог.

---

### 📁 `applications/`
- Хэрэглэгчийн **өгсөн өргөдлүүдтэй** холбоотой бизнес логик.
- `application.controller.ts` – HTTP хүсэлтүүдийг хүлээж авч `service` рүү дамжуулдаг.
- `application.service.ts` – Бизнес логик, өгөгдлийн боловсруулалт.
- `dto/` – Өргөдөл үүсгэх (`create`), хайх (`query`), засах (`update`) DTO төрлүүд.
- `applications.module.ts` – Энэ модультэй холбоотой бүх controller/service-ийг нэгтгэдэг.

---

### 📁 `auth/`
Хэрэглэгчийн **authentication болон authorization** хэсэг.
- `auth.controller.ts`, `auth.service.ts` – Нэвтрэх, JWT үүсгэх, баталгаажуулах.
- `jwt.strategy.ts`, `jwt-auth.guard.ts` – JWT ашиглаж нэвтрэлт шалгах.
- `roles.guard.ts`, `roles.decorator.ts` – Role-оор нэвтрэхийг хянах.
- `admin.guard.ts`, `organisation.guard.ts`, `student.guard.ts` – Ролиудад суурилсан custom guard-ууд.
- `role.enum.ts` – Админ, байгууллага, оюутан гэх мэт **роль төрөл**.

---

### 📁 `config/`
- Аппын **настройк болон орчны тохиргоо**.
- `database.config.ts` – DB connection-ын тохиргоо
- `sequelize.config.js` – Sequelize CLI-д зориулсан тохиргоо

---

### 📁 `database/`
Миграци болон seed файл
- `migrations/` – DB-ийн бүтэц үүсгэх SQL скриптүүд (Sequelize ашигласан)
- `seeders/` – Туршилтын (fake) дата DB-д нэмэх скриптүүд

---

### 📁 `favourites/`
**Дуртай заруудтай** холбоотой хэсэг.
- `add-favourite.dto.ts` – Дуртай зар нэмэх DTO
- Controller, service, module нь нэрнээсээ тодорхой

---

### 📁 `globals/`
- Global төрлүүд эсвэл дахин ашиглагддаг DTO файлууд
- `query.dto.ts` – Хуудаслалт эсвэл шүүлт хийхэд ашиглагддаг DTO

---

### 📁 `internships/`
**Дадлагын заруудтай** холбоотой модулиуд.
- CRUD логик бүхий controller, service
- `create`, `update`, `query` DTO төрлүүд

---

### 📁 `models/`
Sequelize ORM-д зориулсан **модель файлууд**
- DB-ийн хүснэгт бүрт харгалзах `.model.ts` файл (жишээ: `user.model.ts`, `resume.model.ts` гэх мэт)

---

### 📁 `resumes/`
Хэрэглэгчийн **CV/Resume** хэсэг.
- `resumes.controller.ts`, `resumes.service.ts`, `resumes.module.ts`
- `create/update` DTO-ууд education, experience, resume-д тус тус

---

### 📁 `users/`
**Хэрэглэгчтэй** холбоотой логик.
- `create-user.dto.ts`, `login-user.dto.ts`, `update-user.dto.ts`
- Нэвтрэх, хэрэглэгч үүсгэх, шинэчлэх

---

### 📁 `utils/`
- Ашигтай туслах функцүүд
- `pagination.ts` – Хуудаслалтын логикыг энд бичсэн
