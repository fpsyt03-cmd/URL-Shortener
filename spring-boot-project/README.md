# Spring Boot URL Shortener (TinyURL / Bitly Clone)

A beginner-friendly yet interview-grade URL Shortener built with **Java 17**, **Spring Boot 3.3**, and **H2 / MySQL**.

## Features Implemented
1. **Shorten URL**: Accepts long URL and generates a 6-character Base62 code (e.g., `http://localhost:8080/aB3x9Z`).
2. **HTTP 302 Redirection**: Looks up the short code in the database and returns a real `HTTP 302 Found` redirect header.
3. **Click Counter**: Increments the `click_count` column in the database on every visit.
4. **Link Expiration**: Verifies `expires_at`. Expired links return `410 GONE` with an informative error message.
5. **H2 In-Memory DB & Console**: Ready out of the box with zero external setup needed.
6. **MySQL Ready**: Switch from H2 to MySQL with 1 configuration line.

---

## 🛠️ Required VS Code Extensions to Download

Open VS Code, press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac) to open the Extensions view, and install:

1. **Extension Pack for Java** (Publisher: *Microsoft*, ID: `vscjava.vscode-java-pack`)
   - Includes Language Support for Java by Red Hat, Debugger for Java, Maven for Java, Project Manager, and Test Runner.
2. **Spring Boot Extension Pack** (Publisher: *VMware*, ID: `vmware.vscode-spring-boot-pack`)
   - Includes Spring Boot Tools (navigation, property completions), Spring Initializr, and Spring Boot Dashboard.
3. *(Recommended)* **Thunder Client** (Publisher: *Ranga Vadhineni*)
   - Lightweight REST API client inside VS Code for testing endpoints without leaving the editor.
4. *(Optional)* **Database Client** (Publisher: *cweijan*)
   - Connect and query your H2 or MySQL database directly from VS Code.

---

## 🚀 How to Run Locally in VS Code Terminal

### Prerequisites
- Java JDK 17 or higher (`java -version`)
- Maven (or use the included Maven wrapper)

### Step 1: Open Folder in VS Code
Open the project folder in VS Code:
```bash
code .
```

### Step 2: Run via Terminal
Open the integrated terminal (`Ctrl+` ` or `Terminal -> New Terminal`):

**Linux / macOS:**
```bash
./mvnw spring-boot:run
```
*(Or if you have Maven installed:* `mvn spring-boot:run`*)*

**Windows PowerShell / CMD:**
```cmd
.\mvnw.cmd spring-boot:run
```

You will see:
```
URL Shortener is running on http://localhost:8080
H2 Console: http://localhost:8080/h2-console
```

---

## 🧪 Testing the Endpoints via Terminal (curl)

### 1. Shorten a URL
```bash
curl -X POST http://localhost:8080/api/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "longUrl": "https://github.com/spring-projects/spring-boot",
    "expiresInHours": 24
  }'
```
**Response (201 Created):**
```json
{
  "shortCode": "aB3x9Z",
  "shortUrl": "http://localhost:8080/aB3x9Z",
  "longUrl": "https://github.com/spring-projects/spring-boot",
  "createdAt": "2026-09-16T15:30:00",
  "expiresAt": "2026-09-17T15:30:00",
  "clickCount": 0
}
```

### 2. Test the HTTP 302 Redirection
Open your browser and visit:
```
http://localhost:8080/aB3x9Z
```
Or test via curl with verbose redirect headers:
```bash
curl -i http://localhost:8080/aB3x9Z
```
Notice the `HTTP/1.1 302 Found` status and `Location: https://github.com/...` header!

### 3. Check Click Count & Analytics
```bash
curl http://localhost:8080/api/stats/aB3x9Z
```
Notice `"clickCount": 1` (or more, every time you visited the link)!

### 4. Test Expired Link Behavior
Create a link with a past expiration date or wait for it to expire:
```bash
curl -i http://localhost:8080/oldExpiredCode
```
**Response (410 Gone):**
```json
{
  "error": "Link Expired",
  "message": "This link expired on 2026-09-16T14:00:00",
  "status": 410
}
```

---

## 🗄️ Viewing Data in H2 Console
1. Open `http://localhost:8080/h2-console` in your browser
2. Set **JDBC URL** to: `jdbc:h2:mem:urlshortener`
3. Set **User Name** to: `sa`
4. Leave password empty and click **Connect**
5. Run: `SELECT * FROM URL_MAPPINGS;` to see all generated short codes, long URLs, and click counters!

---

## 🐬 Switching from H2 to MySQL (Optional)
In `src/main/resources/application.properties`, comment out H2 and uncomment:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/url_shortener?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=your_mysql_password
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```
