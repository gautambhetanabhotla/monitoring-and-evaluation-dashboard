# User Schema

- `user_id`: Unique identifier for the user (Integer, Primary Key, Auto Increment)
- `username`: Username of the user (String, Unique, Not Null)
- `password`: Hashed password for authentication (String, Not Null, Single-valued)
- `email`: Email address of the user (String, Unique, Not Null, Multi-valued)
- `role`: Role of the user (e.g., admin, client, field staff) (String, Not Null, Single-valued)
- `State/Union Territory`: Region associated with the user (String, Not Null, Single valued)
- `temporary_credentials`: Temporary credentials for client logins (String)
- `last_login`: Timestamp of the user's last login (DateTime, Single valued)
- `activity_log`: Log of user activities (JSON)
- `preferences`: User preferences for data visualization and report formats (JSON)
- `phone_number`: Phone number of the user (String, Unique, Not Null)
- `status`: Status of the user account (e.g., active, inactive) (String, Not Null, Single valued)
- `address`: Address of the user (String)
- `data_entry_period`: Period during which field staff can enter data (DateRange, Not Null)
- `assigned_projects`: List of projects assigned to the field staff (Array of Project IDs)
- **Indexes**:
    - `username_index` on `username`
    - `email_index` on `email`
- **Validation Rules**:
    - `username`: Minimum length 3, maximum length 50
    - `password`: Minimum length 8
    - `email`: Must be a valid email format
    - `status`: Must be one of ['active', 'inactive']
    - `role`: Must be one of ['admin', 'client', 'field staff']
    - `State/Union Territory`: Must be one of ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Delhi', 'Puducherry', 'Ladakh', 'Jammu and Kashmir']
    - `data_entry_period`: Required only if `role` is 'field staff'
    - `assigned_projects`: Required only if `role` is 'field staff'
- **Triggers**:
    - `before_insert_user`: Ensures the email is in lowercase before inserting a new user, and phone number is unique.
    - `after_update_user`: Logs changes to the user's role.
    - `after_delete_user`: Logs the deletion of a user account.
- **Access Control**:
    - `admin`: Full access to all fields.
    - `client`: Read-only access to `username`, `email`, `role`, `phone_number`, `address` and `State/Union Territory`. Full access to `preferences` field.
    - `field staff`: Limited access to data entry fields.

# Project Schema

- `project_id`: Unique identifier for the project (Integer, Primary Key, Auto Increment)
- `title`: Title of the project (String, Not Null, Single-valued)
- `description`: Detailed description of the project (Text)
- `thrust_areas`: List of thrust areas. e.g. education, healthcare, transportation, agriculture etc(multi-valued) (Array of Strings, Not Null)
- `State/Union Territory`: Region associated with the user (String, Not Null, Multi-valued)
- `location`: Location of the project. Dependent on the `State/Union Territory` attribute (String, Multi-valued, Not Null)
- `milestones`: List of milestones with deadlines (Array of Milestone IDs)
- `budget`: Total budget allocated for the project (Decimal, Not Null, Single-valued)
- `budget_usage`: Current usage of the budget (Decimal, Not Null, Single-valued)
- `targets`: List of targets to be achieved (Multi-valued)(Array of Strings)
- `tags`: Tags to mark each project under multiple fields. In accordance to thrust areas of the project(Multi-valued)(Array of Strings)
- `proxy_indicators`: List of proxy indicators for measuring project success (Multi-valued)(Array of Strings)
- `project_term`: Derived attribute indicating the term of the project (e.g., short-term, long-term, high impact) calculated based on the `timeline`(single or dual-valued):
    - `short-term`: Projects with a duration of less than 6 months.
    - `medium-term`: Projects with a duration between 6 months and 2 years.
    - `long-term`: Projects with a duration of more than 2 years.
    - `high impact`: Projects with significant outcomes or strategic importance, regardless of duration.
- `client_id`: Reference to the client associated with the project (Integer, Foreign Key, Multi-valued)
- `status_comparison`: Comparison of project status between different time periods (JSON)
- `completion_status`: Status of project completion (e.g., on time, delayed) (String)
- `average_budget`: Average budget for the project (Decimal, Single-valued)
- `risk_assessment`: Risk assessment details for the project (Text)
- `dependencies`: List of project dependencies (Multi-valued, recursive foreign key)(Array of Project IDs)
- `timeline`:
    - `start_date`: Start date of the project (Date, Not Null, Single-valued)
    - `end_date_expected`: Expected end date of the project (Date, Not Null, Single-valued)
    - `end_date_actual`: Actual end date of the project (Date, can be empty till project ends)
- `duration`: Derived attribute calculated from `start_date` and `end_date_actual` or `end_date_expected`(Single-valued)
- `stakeholder_feedback`: Feedback from different stakeholders (JSON)
- `progress_estimation`: Progress estimation data calculated algorithmically, or entered manually by admin(JSON)
- `kpi`: Key Performance Indicators for the project (JSON)
- `data_visualization`: (references Data Visualisation Schema)
    - `type`: Type of visualization (e.g., bar graph, pie chart, heat map) (String, Not Null)
    - `data`: Data to be visualized (JSON, Not Null)
    - `static`: Static visualization (Boolean, Not Null)
    - `dynamic`: Dynamic visualization (Boolean, Not Null)
- `blog`: Blog section for the project (Text)
- `case_studies`:
    - `title`: Title of the case study (String, Not Null, Single-valued)
    - `content`: Content of the case study (Text, Not Null)
    - `image`: Image associated with the case study (String)
- `progress_bar`: Progress bar for visualizing project progress (Boolean, Not Null). This component dynamically displays the percentage of completion for each milestone of each project, calculated algorithmically or manually(admin) using various parameters with the help of JavaScript.
- `print_options`: Options for printing and downloading data (JSON)
- `summary`: Summary of the project (Text)
- `reports`: List of reports(downloadable) related to the project (Multi-valued)(Array of Report IDs)
- `timeline_graph_comparison_with_progress`: Customizable timeline for viewing project progress (JSON)
- `documents`: List of documents uploaded to the project (Multi-valued)(Array of Document IDs)
- `comments`: List of comments related to the project (Multi-valued)(Array of Comment IDs)
- `status_updates`: Status updates provided by field agents (Multi-valued)(Array of Status Update IDs)
- `images`: List of images uploaded by field agents (Multi-valued)(Array of Image URLs)
- `field_observations`: Field observations provided by field agents (Text)
- `assigned_field_agents`: List of field agents assigned to the project (Multi-valued, Foreign Key)(Array of User IDs)
- **Indexes**:
    - `title_index` on `title`
    - `client_id_index` on `client_id`
- **Validation Rules**:
    - `title`: Minimum length 5, maximum length 100
    - `budget`: Must be a positive number
    - `budget_usage`: Must be a positive number
    - `average_budget`: Must be a positive number if entered
    - `project_term`: Must be one of ['short-term','medium-term','long-term']. Can also have an additional value of 'high-impact'(may be a Boolean value)
    - `description`: Minimum length 300
    - `State/Union Territory`: Must be one or more of ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Delhi', 'Puducherry', 'Ladakh', 'Jammu and Kashmir']
    - `completion_status`: Must be one of ['Not Started', 'In Progress', 'On Hold', 'Succesfully Completed', 'Delayed', 'Cancelled', 'Under review', 'Failed', 'Extended']
    - `duration`: Must be a valid time calculated from `timeline`
    - `summary`: Maximum length 30
    - `assigned_field_agents`: Must reference a user with `role` as field staff
    - `client_id`: Must reference a user with `role` as client
    - All key, referential integrity and other constraints have to be taken care of.
- **Triggers**:
    - `before_insert_project`: Sets the default value for `completion_status` if not provided.
    - `after_update_project`: Logs changes to the project's budget.
- **Access Control**:
    - `admin`: Full access to fields.
    - `client`: Read-only access to `title`, `description`, `thrust_areas`, `location`, `milestones`, `targets`, `indicators`, `tags`, `proxy_indicators`, `State/Union Territory`, `completion_status`, `blog`, `case_studies`, `summary`, `reports`, `timeline_graph_comparison_with_progress`, `documents` and `feedback`. Full access to `type` of `data visualisation`, `comments`(associated with them) and `print_options`.
    - `field staff`: Limited access to data entry fields.

# Milestone Schema

- `milestone_id`: Unique identifier for the milestone (Integer, Primary Key, Auto Increment)
- `project_id`: Reference to the associated project (Integer, Foreign Key, Not Null)
- `title`: Title of the milestone (String, Not Null)
- `description`: Detailed description of the milestone (Text)
- `deadline`: Deadline for the milestone (Date, Not Null)
- `completion_percentage`: Percentage completion of the milestone (Decimal, Not Null)
- `stakeholder_feedback`: Feedback from different stakeholders (JSON)
- `baseline_data`: Baseline data collected by field staff (JSON)
- **Indexes**:
    - `project_id_index` on `project_id`
- **Validation Rules**:
    - `title`: Minimum length 5, maximum length 100
    - `description`: Minimum length 50
    - `deadline`: Must be a valid date
    - `completion_percentage`: Must be between 0 and 100
    - All key, referential integrity and other constraints have to be taken care of.
- **Triggers**:
    - `before_insert_milestone`: Ensures the deadline is in the future.
    - `after_update_milestone`: Logs changes to the milestone's deadline.
- **Access Control**:
    - `admin`: Full access to all fields.
    - `client`: Read-only access to `title`, `description`, `deadline`, `stakeholder_feedback` and `completion_percentage`.
    - `field staff`: Limited access to data entry fields.

# Authentication Schema

- `auth_id`: Unique identifier for the authentication record (Integer, Primary Key, Auto Increment)
- `user_id`: Reference to the authenticated user (Integer, Foreign Key, Not Null)
- `token`: Authentication token (String, Not Null)
- `expiration`: Expiration date and time of the token (DateTime, Not Null)
- **Indexes**:
    - `user_id_index` on `user_id`
    - `token_index` on `token`
- **Validation Rules**:
    - `token`: Minimum length 20
    - `expiration`: Must be a valid date-time (in near future)
    - All key, referential integrity and other constraints have to be taken care of.
- **Triggers**:
    - `before_insert_auth`: Ensures the token is unique.
    - `after_delete_auth`: Logs the deletion of an authentication record.
- **Access Control**:
    - `admin`: Full access to all fields.
    - `client`: No access.
    - `field staff`: No access.

# Views Schema (for different roles)

- `view_id`: Unique identifier for the view (Integer, Primary Key, Auto Increment)
- `user_id`: Reference to the user associated with the view (Integer, Foreign Key, Not Null)
- `role`: Role associated with the view (e.g., admin, client, field staff)(String, Foreign key, Not Null, Single-valued)
- `components`: Configuration of UI components accessible in the view (JSON, Not Null)
- **Indexes**:
    - `role_index` on `role`
- **Validation Rules**:
    - `role`: Must be one of ['admin', 'client', 'field staff']
    - `components`: Must be valid JSON
    - All key, referential integrity and other constraints have to be taken care of.
- **Triggers**:
    - `before_insert_view`: Ensures the role is valid.
    - `after_update_view`: Logs changes to the view's components.
- **Access Control**:
    - `admin`: Full access to all fields.
    - `client`: Read-only access to `components` and `role`.
    - `field staff`: Read-only access to `components` and `role`.

# Comment Schema

- `comment_id`: Unique identifier for the comment (Integer, Primary Key, Auto Increment)
- `project_id`: Reference to the associated project (Integer, Foreign Key, Not Null)
- `user_id`: Reference to the user who made the comment (Integer, Foreign Key, Not Null)
- `content`: Content of the comment (Text, Not Null)
- `timestamp`: Timestamp of when the comment was made (DateTime, Not Null)
- **Indexes**:
    - `project_id_index` on `project_id`
    - `user_id_index` on `user_id`
- **Validation Rules**:
    - `content`: Must not be empty
    - `timestamp`: Must be a valid date-time
    - All key, referential integrity and other constraints have to be taken care of.
- **Triggers**:
    - `after_insert_comment`: Notify admin, field staff and other clients related to the project when a new comment is made.
- **Access Control**:
    - `admin`: Full access to all fields.
    - `client`: Full access to create and read comments. Read only access to `timestamp`.
    - `field staff`: Read only access to `timestamp` and `content`.

# Communication Schema

- `message_id`: Unique identifier for the message (Integer, Primary Key, Auto Increment)
- `sender_id`: Reference to the user who sent the message (Integer, Foreign Key, Not Null)
- `receiver_id`: Reference to the user who received the message (Integer, Foreign Key, Not Null)
- `content`: Content of the message (Text, Not Null)
- `timestamp`: Timestamp of when the message was sent (DateTime, Not Null)
- **Indexes**:
    - `sender_id_index` on `sender_id`
    - `receiver_id_index` on `receiver_id`
- **Validation Rules**:
    - `content`: Must not be empty
    - `timestamp`: Must be a valid date-time
    - All key, referential integrity and other constraints have to be taken care of.
- **Triggers**:
    - `after_insert_message`: Notify the receiver when a new message is sent.
- **Access Control**:
    - `admin`: Full access to all fields.
    - `client`: Full access to send and receive messages. Read only access to `timestamp`.
    - `field staff`: Full access to send and receive messages. Read only access to `timestamp`.

# Data Visualization Schema

- `visualization_id`: Unique identifier for the visualization (Integer, Primary Key, Auto Increment)
- `heading`: Heading for the chart (String, Not Null)
- `chart`: Configuration or rendered image of the chart or graph. Dynamic, changes on basis of fetched data from the referenced file and type. (JSON, Not Null)
- `caption`: Caption for the visualization (String, Not Null)
- `legend`: Legend for the visualization (JSON, Not Null)
- `project_id`: Reference to the associated project (Integer, Foreign Key, Not Null)
- `type`: Type of visualization (e.g., bar graph, histogram, pie chart) (String, Not Null)
- `data`: Data to be visualized (JSON, Not Null)
- `attributes`: Attributes of the visualization (JSON, Not Null)
- `data_file`: Reference to the data file used for the visualization (String, Not Null)
- `print_options`: Options for printing and downloading data (JSON)
- `user_id`: List of all field staffs who contributed to collection of tha data loaded in the referenced data file (Integer, Foreign Key, Multi-valued)(Array of user_id)
- `reports`: List of reports(downloadable) related to the data (Integer, Foreign Key, Multi-valued)(Array of Report IDs)
- **Indexes**:
    - `project_id_index` on `project_id`
- **Validation Rules**:
    - `type`: Must be one of ['bar graph', 'histogram', 'pie chart', 'tree map', 'funnel graph', 'sunburst chart', 'clustered bar chart', 'stacked bar chart', 'donut chart', 'heat map', 'circle chart', 'line chart', 'Scatter plot', 'Bubble chart', 'Area chart', 'Radar chart', 'Box plot', 'Waterfall chart', 'Gantt chart', 'Violin plot', 'Sankey diagram', 'Chord diagram', 'Network graph', 'Gauge chart', 'Candlestick chart', 'Bullet chart', 'Mosaic plot']
    - `chart`: Must match the structure and content (in the specified `data_file` in JSON) required for the specified `type`
    - `data`: Must be valid JSON. The data must match the content of the referenced data file.
    - `attributes`: Must be valid JSON
    - `data_file`: Must not be empty. The referenced file must exist and be accessible.
    - `user_id`: Must reference to one or more field staffs (by `role`) only
    - All key, referential integrity and other constraints have to be taken care of.
- **Triggers**:
    - `after_insert_visualization`: Notify the admin when a new visualization is created.
    - `after_update_visualization`: Notify the admin when a visualization is updated (Any JSON file changes).
    - `after_delete_visualization`: Notify the admin when a visualization is deleted.
- **Access Control**:
    - `admin`: Full access to all fields.
    - `client`: Read-only access to `heading`, `caption`, `legend`, `reports` and `chart`. Full access to `type` and `print_options`.
    - `field staff`: No access.

# Logging Schema

- `log_id`: Unique identifier for the log entry (Integer, Primary Key, Auto Increment)
- `user_id`: Reference to the user who performed the action (Integer, Foreign Key, Not Null)
- `action`: Description of the action performed (String, Not Null)
- `timestamp`: Timestamp of when the action was performed (DateTime, Not Null)
- **Indexes**:
    - `user_id_index` on `user_id`
- **Validation Rules**:
    - `action`: Must not be empty
    - `timestamp`: Must be a valid date-time
    - All key, referential integrity and other constraints have to be taken care of.
- **Triggers**:
    - `after_insert_log`: Notify the admin when a new log entry is created.
- **Access Control**:
    - `admin`: Full access to all fields.
    - `client`: No access.
    - `field staff`: No access.

# Report Schema

- `report_id`: Unique identifier for the report (Integer, Primary Key, Auto Increment)
- `project_id`: Reference to the associated project (Integer, Foreign Key, Not Null)
- `data_visualisation_id`:Reference to the associated project (Integer, Foreign Key, May be Null)
- `type`: Type of report (e.g., PDF, PPT, CSV) (String, Not Null)
- `content`: Content of the report (Text, Not Null)
- `timestamp`: Timestamp of when the report was generated (DateTime, Not Null)
- **Indexes**:
    - `project_id_index` on `project_id`
- **Validation Rules**:
    - `type`: Must be one of ['PDF', 'PPT'/'ODP', 'DOC'/'ODT', 'TXT', 'RTF', 'XLS'/'CSV', 'JPEG'/'PNG']
    - `content`: Must not be empty
    - `timestamp`: Must be a valid date-time
    - All key, referential integrity and other constraints have to be taken care of.
- **Triggers**:
    - `after_insert_report`: Notify the admin when a new report is generated.
- **Access Control**:
    - `admin`: Full access to all fields.
    - `client`: Read-only access to `content` and `timestamp`. Full access to `type`.
    - `field staff`: Read-only access to `content` and `timestamp`. Full access to `type`.

# Client Access Control Schema

- `client_access_id`: Unique identifier for the client access control record (Integer, Primary Key, Auto Increment)
- `client_id`: Reference to the client (Integer, Foreign Key, Not Null)
- `project_id`: Reference to the project (Integer, Foreign Key, Not Null)
- `access_level`: Access level of the client for the project (e.g., blocked, read-only, read and write) (String, Not Null)
- **Indexes**:
    - `client_id_index` on `client_id`
    - `project_id_index` on `project_id`
- **Validation Rules**:
    - `access_level`: Must be one of ['blocked', 'read-only', 'read and write']
- **Triggers**:
    - `after_update_client_access`: Notify the admin when a client's access level is changed.
- **Access Control**:
    - `admin`: Full access to all fields.
    - `client`: No access.
    - `field staff`: No access.

# Notification Preferences Schema

- `notification_pref_id`: Unique identifier for the notification preference record (Integer, Primary Key, Auto Increment)
- `user_id`: Reference to the user (Integer, Foreign Key, Not Null)
- `email_notifications`: Whether the user wants email notifications (Boolean, Not Null)
- `sms_notifications`: Whether the user wants SMS notifications (Boolean, Not Null)
- `push_notifications`: Whether the user wants push notifications (Boolean, Not Null)
- **Indexes**:
    - `user_id_index` on `user_id`
- **Validation Rules**:
    - `email_notifications`: Must be true or false
    - `sms_notifications`: Must be true or false
    - `push_notifications`: Must be true or false
- **Triggers**:
    - `after_update_notification_pref`: Notify the user when their notification preferences are updated.
- **Access Control**:
    - `admin`: Full access to all fields.
    - `client`: Full access to their own notification preferences.
    - `field staff`: Full access to their own notification preferences.

# Success Story Schema

- `story_id`: Unique identifier for the success story (Integer, Primary Key, Auto Increment)
- `project_id`: Reference to the associated project (Integer, Foreign Key, Not Null)
- `title`: Title of the success story (String, Not Null)
- `content`: Content of the success story (Text, Not Null)
- `images`: List of images associated with the success story (Array of Strings)
- `timestamp`: Timestamp of when the success story was published (DateTime, Not Null)
- **Indexes**:
    - `project_id_index` on `project_id`
- **Validation Rules**:
    - `title`: Minimum length 5, maximum length 100
    - `content`: Must not be empty
    - `timestamp`: Must be a valid date-time in past
    - All key, referential integrity and other constraints have to be taken care of.
- **Triggers**:
    - `before_insert_story`: Validates the content before inserting a new success story.
- **Access Control**:
    - `admin`: Full access to all fields.
    - `client`: Read-only access to `title`, `content`, `images` and `timestamp`.
    - `field staff`: Read-only access to `title`, `content`, `images` and `timestamp`.

# Dashboard Schema

- `dashboard_id`: Unique identifier for the dashboard (Integer, Primary Key, Auto Increment)
- `role`: Role of the user for which the dashboard is designed (String, Foreign Key, Not Null)
- `layout`: Layout configuration for the dashboard (JSON/HTML/CSS, Not Null)
- `widgets`: List of widgets included in the dashboard (Array of Widget IDs)
- **Indexes**:
    - `role_index` on `role`
- **Validation Rules**:
    - `role`: Must be one of the predefined roles (e.g., admin, client, field staff)
    - `layout`: Must be a valid JSON object
- **Triggers**:
    - `before_insert_dashboard`: Validates the layout before inserting a new dashboard.
- **Access Control**:

    - `admin`: Full access to all fields.
    - `client`: No access.
    - `field staff`: No access.

    # Update Request Schema

- `request_id`: Unique identifier for the update request (Integer, Primary Key, Auto Increment)
- `user_id`: Reference to the user making the request (Integer, Foreign Key, Not Null)
- `field`: The field to be updated (e.g., email, phone_number, address, role) (String, Not Null)
- `new_value`: The new value for the field (String, Not Null)
- `status`: Status of the request (e.g., pending, approved, denied) (String, Not Null)
- `timestamp`: Timestamp of when the request was made (DateTime, Not Null)
- **Indexes**:
    - `user_id_index` on `user_id`
    - `status_index` on `status`
- **Validation Rules**:
    - `field`: Must be a valid read-only field that can be updated without security or other concerns
    - `new_value`: Must not be empty, and valid as per the field's constraints
    - `status`: Must be one of ['pending', 'approved', 'denied']
    - `timestamp`: Must be a valid date-time in past
    - `user_id`: Must refernce to a user whose role is one of ['client', 'field staff']
    - All key, referential integrity and other constraints have to be taken care of.
- **Triggers**:
    - `before_insert_update_request`: Validates the `new_value` based on the `field` being updated. Ensures the `field` is read only, `role` is not admin, and `new_value` is of the correct type and does not violate any constraint.
    - `after_update_request`: Notify the user when their update request is approved or denied.
- **Access Control**:
    - `admin`: Full access to all fields.
    - `client`: Full access to create and view their own update requests.
    - `field staff`: Full access to create and view their own update requests.

# Status Update Schema

- `status_update_id`: Unique identifier for the status update (Integer, Primary Key, Auto Increment)
- `project_id`: Reference to the associated project (Integer, Foreign Key, Not Null)
- `user_id`: Reference to the user who provided the status update (Integer, Foreign Key, Not Null)
- `status`: Current status of the project (e.g., on track, delayed, completed) (String, Not Null)
- `description`: Detailed description of the status update (Text, Not Null)
- `timestamp`: Timestamp of when the status update was provided (DateTime, Not Null)
- **Indexes**:
    - `project_id_index` on `project_id`
    - `user_id_index` on `user_id`
- **Validation Rules**:
    - `status`: Must be one of ['Not Started', 'In Progress', 'On Hold', 'Succesfully Completed', 'Delayed', 'Cancelled', 'Under review', 'Failed', 'Extended']
    - `description`: Must not be empty
    - `timestamp`: Must be a valid date-time in past
    - `user_id`: Must reference a user with `role` as field staff.
    - All key, referential integrity and other constraints have to be taken care of.
- **Triggers**:
    - `after_insert_status_update`: Notify the admin and related clients when a new status update is provided.
- **Access Control**:
    - `admin`: Full access to all fields.
    - `client`: Read-only access to status updates; `status`, `description` and `timestamp`.
    - `field staff`: Full access to create and read status updates, namely `status` and `description`. Read only access to `timestamp`.
