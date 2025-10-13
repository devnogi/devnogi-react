
# API Documentation

This document provides documentation for all the API endpoints in the devnogi-community-server project.

## AnnouncementController

### Create Announcement
- **Description:** This API registers a post as an announcement.
- **HTTP Method:** `POST`
- **Path:** `/api/announcements/{postId}`
- **Request:**
    - **Path Variable:**
        - `postId` (Long): The ID of the post to be registered as an announcement.
    - **Request Body:** `AnnouncementCreateRequest`
        ```json
        {
            "isGlobal": "boolean"
        }
        ```
- **Response:**
    - **Success Status Code:** 201 (Created)
    - **Response Body:** `AnnouncementPersistResponse`
        ```json
        {
            "id": "long"
        }
        ```

### Delete Announcement
- **Description:** This API deletes an announcement.
- **HTTP Method:** `DELETE`
- **Path:** `/api/announcements/{id}`
- **Request:**
    - **Path Variable:**
        - `id` (Long): The ID of the announcement to be deleted.
- **Response:**
    - **Success Status Code:** 204 (No Content)

### Toggle Global Announcement
- **Description:** This API toggles the global visibility of an announcement.
- **HTTP Method:** `PATCH`
- **Path:** `/api/announcements/toggle-global/{id}`
- **Request:**
    - **Path Variable:**
        - `id` (Long): The ID of the announcement to be toggled.
- **Response:**
    - **Success Status Code:** 200 (OK)
    - **Response Body:** `AnnouncementToggleResponse`
        ```json
        {
            "id": "long",
            "isGlobal": "boolean"
        }
        ```

### Get Announcements by Board
- **Description:** This API retrieves all announcements for a specific board.
- **HTTP Method:** `GET`
- **Path:** `/api/announcements/{boardId}`
- **Request:**
    - **Path Variable:**
        - `boardId` (Long): The ID of the board.
- **Response:**
    - **Success Status Code:** 200 (OK)
    - **Response Body:** `List<AnnouncementPageResponseItem>`
        ```json
        [
            {
                "postId": "long",
                "title": "string",
                "isGlobal": "boolean"
            }
        ]
        ```

## BoardController

### Create Board
- **Description:** This API creates a new board.
- **HTTP Method:** `POST`
- **Path:** `/api/boards`
- **Request:**
    - **Request Body:** `BoardCreateRequest`
        ```json
        {
            "name": "string",
            "description": "string",
            "topCategory": "string",
            "subCategory": "string"
        }
        ```
- **Response:**
    - **Success Status Code:** 201 (Created)
    - **Response Body:** `BoardPersistResponse`
        ```json
        {
            "id": "long"
        }
        ```

### Get All Boards
- **Description:** This API retrieves all boards, sorted by topCategory and subCategory.
- **HTTP Method:** `GET`
- **Path:** `/api/boards`
- **Response:**
    - **Success Status Code:** 200 (OK)
    - **Response Body:** `BoardListResponse`
        ```json
        {
            "count": "int",
            "boards": [
                {
                    "id": "long",
                    "name": "string",
                    "description": "string",
                    "topCategory": "string",
                    "subCategory": "string"
                }
            ]
        }
        ```

### Update Board
- **Description:** This API updates an existing board.
- **HTTP Method:** `PATCH`
- **Path:** `/api/boards/{id}`
- **Request:**
    - **Path Variable:**
        - `id` (Long): The ID of the board to be updated.
    - **Request Body:** `BoardUpdateRequest`
        ```json
        {
            "name": "string",
            "description": "string",
            "topCategory": "string",
            "subCategory": "string"
        }
        ```
- **Response:**
    - **Success Status Code:** 200 (OK)
    - **Response Body:** `BoardPersistResponse`
        ```json
        {
            "id": "long"
        }
        ```

### Delete Board
- **Description:** This API deletes a board.
- **HTTP Method:** `DELETE`
- **Path:** `/api/boards/{id}`
- **Request:**
    - **Path Variable:**
        - `id` (Long): The ID of the board to be deleted.
- **Response:**
    - **Success Status Code:** 204 (No Content)

## CommentController

### Create Comment
- **Description:** This API creates a new comment.
- **HTTP Method:** `POST`
- **Path:** `/api/comments/{postId}`
- **Request:**
    - **Path Variable:**
        - `postId` (Long): The ID of the post to which the comment is being added.
    - **Request Body:** `CommentCreateRequest`
        ```json
        {
            "parentComment": "long",
            "content": "string"
        }
        ```
- **Response:**
    - **Success Status Code:** 201 (Created)
    - **Response Body:** `CommentPersistResponse`
        ```json
        {
            "id": "long"
        }
        ```

### Update Comment
- **Description:** This API updates an existing comment.
- **HTTP Method:** `PATCH`
- **Path:** `/api/comments/{id}`
- **Request:**
    - **Path Variable:**
        - `id` (Long): The ID of the comment to be updated.
    - **Request Body:** `CommentUpdateRequest`
        ```json
        {
            "content": "string"
        }
        ```
- **Response:**
    - **Success Status Code:** 200 (OK)
    - **Response Body:** `CommentPersistResponse`
        ```json
        {
            "id": "long"
        }
        ```

### Delete Comment
- **Description:** This API deletes a comment.
- **HTTP Method:** `DELETE`
- **Path:** `/api/comments/{id}`
- **Request:**
    - **Path Variable:**
        - `id` (Long): The ID of the comment to be deleted.
- **Response:**
    - **Success Status Code:** 204 (No Content)

### Find Comments by Post ID
- **Description:** This API retrieves comments for a specific post.
- **HTTP Method:** `GET`
- **Path:** `/api/comments/{postId}`
- **Request:**
    - **Path Variable:**
        - `postId` (Long): The ID of the post.
    - **Query Parameters:** `CustomPageRequest`
- **Response:**
    - **Success Status Code:** 200 (OK)
    - **Response Body:** `CustomPageResponse<CommentPageResponseItem>`
        ```json
        {
            "content": [
                {
                    "id": "long",
                    "userId": "long",
                    "parentComment": "long",
                    "content": "string",
                    "likeCount": "int",
                    "isDeleted": "boolean",
                    "isBlocked": "boolean",
                    "isLiked": "boolean"
                }
            ],
            "meta": {
                "page": "int",
                "size": "int",
                "totalElements": "long",
                "totalPages": "int",
                "last": "boolean"
            }
        }
        ```

### Toggle Comment Like
- **Description:** This API toggles the like status of a comment.
- **HTTP Method:** `POST`
- **Path:** `/api/comments/like`
- **Request:**
    - **Request Body:** `CommentLikeToggleRequest`
        ```json
        {
            "commentId": "long"
        }
        ```
- **Response:**
    - **Success Status Code:** 204 (No Content)

## NoticeController

### Send Notice
- **Description:** This API sends a notification.
- **HTTP Method:** `POST`
- **Path:** `/api/notices`
- **Request:**
    - **Request Body:** `NoticeSendRequest`
        ```json
        {
            "receiverId": "long",
            "noticeType": "string",
            "url": "string",
            "senderId": "long"
        }
        ```
- **Response:**
    - **Success Status Code:** 201 (Created)
    - **Response Body:** `NoticePersistResponse`
        ```json
        {
            "id": "long"
        }
        ```

### Get Detail Notice
- **Description:** This API retrieves a specific notification by its ID.
- **HTTP Method:** `GET`
- **Path:** `/api/notices/{id}`
- **Request:**
    - **Path Variable:**
        - `id` (Long): The ID of the notification.
- **Response:**
    - **Success Status Code:** 200 (OK)
    - **Response Body:** `NoticeCommonResponse`
        ```json
        {
            "id": "long",
            "userId": "long",
            "title": "string",
            "contents": "string",
            "url": "string",
            "createdAt": "string",
            "isRead": "boolean"
        }
        ```

### Get Notice List
- **Description:** This API retrieves a list of notifications for a user within a specified number of days.
- **HTTP Method:** `GET`
- **Path:** `/api/notices`
- **Request:**
    - **Query Parameters:**
        - `userId` (Long): The ID of the user.
        - `day` (Integer): The number of days to look back for notifications.
- **Response:**
    - **Success Status Code:** 200 (OK)
    - **Response Body:** `List<NoticeCommonResponse>`
        ```json
        [
            {
                "id": "long",
                "userId": "long",
                "title": "string",
                "contents": "string",
                "url": "string",
                "createdAt": "string",
                "isRead": "boolean"
            }
        ]
        ```

## PostController

### Create Post
- **Description:** This API creates a new post.
- **HTTP Method:** `POST`
- **Path:** `/api/posts`
- **Request:**
    - **Request Body:** `PostCreateRequest`
        ```json
        {
            "boardId": "long",
            "title": "string",
            "content": "string",
            "isDraft": "boolean",
            "tags": ["string"]
        }
        ```
- **Response:**
    - **Success Status Code:** 201 (Created)
    - **Response Body:** `PostPersistResponse`
        ```json
        {
            "id": "long"
        }
        ```

### Get Post
- **Description:** This API retrieves a single post by its ID.
- **HTTP Method:** `GET`
- **Path:** `/api/posts/details/{id}`
- **Request:**
    - **Path Variable:**
        - `id` (Long): The ID of the post.
- **Response:**
    - **Success Status Code:** 200 (OK)
    - **Response Body:** `PostDetailResponse`
        ```json
        {
            "id": "long",
            "boardId": "long",
            "userId": "long",
            "title": "string",
            "content": "string",
            "viewCount": "int",
            "likeCount": "int",
            "commentCount": "int",
            "isDraft": "boolean",
            "isBlocked": "boolean",
            "isLiked": "boolean",
            "createdAt": "string",
            "updatedAt": "string"
        }
        ```

### Get Posts
- **Description:** This API retrieves a list of posts.
- **HTTP Method:** `GET`
- **Path:** `/api/posts`
- **Request:**
    - **Query Parameters:** `CustomPageRequest`
- **Response:**
    - **Success Status Code:** 200 (OK)
    - **Response Body:** `CustomPageResponse<PostSummaryResponse>`
        ```json
        {
            "content": [
                {
                    "id": "long",
                    "title": "string",
                    "viewCount": "int",
                    "likeCount": "int",
                    "commentCount": "int",
                    "createdAt": "string"
                }
            ],
            "meta": {
                "page": "int",
                "size": "int",
                "totalElements": "long",
                "totalPages": "int",
                "last": "boolean"
            }
        }
        ```

### Update Post
- **Description:** This API updates an existing post.
- **HTTP Method:** `PATCH`
- **Path:** `/api/posts/{id}`
- **Request:**
    - **Path Variable:**
        - `id` (Long): The ID of the post to be updated.
    - **Request Body:** `PostUpdateRequest`
        ```json
        {
            "title": "string",
            "content": "string",
            "isDraft": "boolean",
            "tags": ["string"]
        }
        ```
- **Response:**
    - **Success Status Code:** 200 (OK)
    - **Response Body:** `PostPersistResponse`
        ```json
        {
            "id": "long"
        }
        ```

### Delete Post
- **Description:** This API deletes a post.
- **HTTP Method:** `DELETE`
- **Path:** `/api/posts/{id}`
- **Request:**
    - **Path Variable:**
        - `id` (Long): The ID of the post to be deleted.
- **Response:**
    - **Success Status Code:** 204 (No Content)

### Like Post
- **Description:** This API toggles the like status of a post.
- **HTTP Method:** `POST`
- **Path:** `/api/posts/like`
- **Request:**
    - **Request Body:** `PostLikeCreateRequest`
        ```json
        {
            "postId": "long"
        }
        ```
- **Response:**
    - **Success Status Code:** 204 (No Content)

### Get Posts by Board ID
- **Description:** This API retrieves a list of posts for a specific board.
- **HTTP Method:** `GET`
- **Path:** `/api/posts/{boardId}`
- **Request:**
    - **Path Variable:**
        - `boardId` (Long): The ID of the board.
    - **Query Parameters:** `CustomPageRequest`
- **Response:**
    - **Success Status Code:** 200 (OK)
    - **Response Body:** `CustomPageResponse<PostSummaryResponse>`
        ```json
        {
            "content": [
                {
                    "id": "long",
                    "title": "string",
                    "viewCount": "int",
                    "likeCount": "int",
                    "commentCount": "int",
                    "createdAt": "string"
                }
            ],
            "meta": {
                "page": "int",
                "size": "int",
                "totalElements": "long",
                "totalPages": "int",
                "last": "boolean"
            }
        }
        ```

## TagController

### Find Tags by Post ID
- **Description:** This API retrieves the tags for a specific post.
- **HTTP Method:** `GET`
- **Path:** `/api/tags/{postId}`
- **Request:**
    - **Path Variable:**
        - `postId` (Long): The ID of the post.
- **Response:**
    - **Success Status Code:** 200 (OK)
    - **Response Body:** `List<TagResponse>`
        ```json
        [
            {
                "name": "string"
            }
        ]
        ```
