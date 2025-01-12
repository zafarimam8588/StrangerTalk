# Omegle Clone

This is a clone of the popular video chat platform, Omegle, built with TypeScript, React, Express, and Socket.IO. The application allows users to connect randomly with other users in a one-on-one video chat experience.

## Features
* Randomized user connection

* Real-time video and audio communication

* ICE candidate handling for WebRTC

* Modularized backend and frontend logic
## Table of Contents

- **Tech Stack**
  
- **Getting Started**
  
- **Folder Structure**
  
  - **Backend Details**
    - index.ts
    - UserManager.ts
    - RoomManager.ts
  - **Frontend Details**
    - Landing.tsx
    - Room.tsx
- **How It Works**
  
## **Tech Stack**
  - **Backend**
    - Node.js with TypeScript
    - Express
    - Socket.IO
  - **Frontend**
    - React with TypeScript
    - WebRTC
   
## **Getting Started**
  - **Prerequisites**
    - Node.js (>=16.0)
    - npm or yarn
  - **Installation**
    1. Clone the repository:
    ```
    https://github.com/zafarimam8588/omegle.git
    cd omegle
    ```
    2. Install dependencies:
    ```
    # Install server dependencies
    cd server
    npm install
    
    # Install client dependencies
    cd client
    npm install
    ```
    3 . Start the development servers:
    ```
    # Start the backend server
    cd server
    npm run dev
    
    # Start the frontend server
    cd client
    npm run dev
    ```
    4. Open the app in your browser at ``` http://localhost:5173 ```.
## **Backend Details**
  - **index.ts**
    
    - The server entry point initializes the Express application and sets up Socket.IO for real-time communication. It listens for new user connections and manages disconnections.
    - **Key Features:**
      - Sets up Socket.IO with CORS configuration
      - Manages user addition and removal with UserManager
      - Handles WebSocket events like add-user, offer, answer, and add-ice-candidate
        
  - **UserManager.ts**
    - Manages connected users and their state.
    - **Key Features:**
      - Maintains a queue of users waiting to be matched
      - Matches two users and creates a room for them using RoomManager
      - Handles WebSocket events like offer, answer, and add-ice-candidate
        
  - **RoomManager.ts**
    - Handles the logic for managing rooms and WebRTC signaling.
    - **Key Features:**
      - Creates rooms for matched users
      - Facilitates WebRTC signaling by forwarding offer, answer, and ICE candidates between users

## **Frontend Details**
  - **Landing.tsx**
    
    - The landing page allows the user to:
      1. Enter their name.
      2. Initialize their video and audio streams using the getUserMedia API.
      3. Join the application by navigating to the Room component.
    - **Key Features:**
      - Captures video and audio from the user’s device
      - Displays the local video stream
      - Passes user details and media streams to the Room component
        
  - **Room.tsx**
    - Handles the WebRTC connection and establishes a video call between two users.
    - **Key Features:**
      - Connects to the Socket.IO server and listens for WebSocket events
      - Manages WebRTC PeerConnection for video and audio streaming
      - Displays both local and remote video streams
      - Handles signaling events like offer, answer, and ICE candidates

## **How It Works**
  - **User Connection:**
    
    - The user lands on the Landing page, enters their name, and starts their camera.
    - When they join, their details are sent to the backend.
  - **User Matching:**
    
    - The backend places users in a queue.
    - When two users are available, the RoomManager creates a room and notifies both users.
  - **WebRTC Setup:**
    
    - The first user sends an offer to the second user.
    - The second user responds with an answer.
    - Both users exchange ICE candidates to establish a peer-to-peer connection.
  - **Video Chat:**
    
    - Once connected, users can see and hear each other in real-time.
