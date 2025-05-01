```
App
|--BrowserRouter
   |--AuthProvider
      |--Routes
         |--Route "/" HomePage
         |--Route "/unauthorized" Unauthorized
         |--Route "/projects"
            |--ProtectedRoute
               |--ProjectGallery
         |--Route "/admin"
            |--ProtectedRoute
               |--Admin
         |--Route "/field-staff"
            |--ProtectedRoute
               |--Field_Staff
         |--Route "/clients"
            |--ProtectedRoute
               |--ClientGallery
         |--Route "/<project_id>"
            |--ProtectedRoute
               |--ProjectPage
            |--Route
```