To run the Application :

1. Clone the repository
2. Install the node modules
3. npm start

Instructions to Connect Database:

Please add your database configurations in config/db-config.js file
PLEASE Provide the following details for database connection
    user: 'username',
    password: 'password',
    server: 'server address',
    database: 'db'

* I have used Sql as database
* further you have to create tables in your database i'm providing the query for the same 
-- Users Table
CREATE TABLE S3Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username VARCHAR(50) UNIQUE,
    Email VARCHAR(100),
    Password VARCHAR(100),
);
 
-- Buckets Table
CREATE TABLE S3Buckets (
    BucketID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT,
    BucketName VARCHAR(100),
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserID) REFERENCES s3Users(UserID)
);
 
-- Objects Table
CREATE TABLE S3Objects (
    ObjectID INT IDENTITY(1,1) PRIMARY KEY,
    BucketID INT,
    ObjectName VARCHAR(100),
    FilePath VARCHAR(255),
    FileSize INT,
    UploadedAt DATETIME DEFAULT GETUTCDATE(),
    FOREIGN KEY (BucketID) REFERENCES S3Buckets(BucketID)
);
please create these table in your database to perform the operations 

Also i'm adding postman collection for your reference 


