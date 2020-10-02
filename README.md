# Assignment 1:  Different Architectures

This is a three part assignment where you will implement a simple VR experience in three different programming environments: Babylon.js, Playcanvas, and A-Frame.

The goal of the assignment is to have you gain experience with three very different architectures, and to reflect on these differences.  [Babylon.js](https://babylonjs.org) is an object-hierarchy architecture, similar to other systems like three.js and numerous non-web graphics libraries.  [Playcanvas](https://playcanvas.com) uses an Entity-Component architecture, similar to Unity, Unreal, and other game engines.  ~~[A-Frame](https://aframe.io) is a mix of the two, and is implement using custom DOM elements so that the scene graph sits in the HTML page.~~  For the third part, you will translate your Playcanvas Editor project to using only the underlying Playcanvas Engine.

This repository is for the third of the three parts of the assignment, where you will use the Playcanvas Engine.

# Assignment 1(c):  PlayCanvas VR Experience in Code

This is a skeleton, based on converting the Playcanvas XR Starter project to the Playcanvas Engine. As such, you will be able to do a similar set of modifications to it as you did to the Editor sample for 1(b).  It uses a similar structure for local building and development as our previous Babylon projects, so you can run and test as you have for Babylon.

For this assignment, you will convert your Assignment 1(b) solution to use the Engine.  The engine is available on [github](https://github.com/playcanvas/engine), and contains many examples.  We have built and included a copy of the engine here (including building source maps and Typescript .d.ts files). (note: we [fixed a few omissions and errors in the .d.ts files](https://github.com/playcanvas/engine/issues/2458), so you probably don't want to rebuild them from source until those changes are made in the engine repo.)  However, please download the engine so you can refer to the examples and source as needed.

The learning objective of this assignment is to more fully understand how Playcanvas works and how implementing a project using just code can have a very similar structure to using Unity or Playcanvas.  You will also see how there are opportunities to structure your code that cross between the Playcanvas Editor (and Unity) "attach code as scripts to nodes in the graph" and "merge the code into the main line of the project."

I have [created a video and put it on Perusall](https://app.perusall.com/courses/3d-user-interfaces/_/dashboard/documents/document-eyqmc8xzRFzNcCnQP) walking through this code and showing you how I figured out the various parts while replicating the Playcanvas XR Sample in the engine.

## Due: Friday October 9th, 11:59am (noon)

## Name and GT user-id

Name: 
User ID:

## Rubric

Graded out of 5. You should be able to get much the same grade as you got on a(b) since you can reuse much of that code.

0. Ensure your program builds with no Typescript warnings. (1)
2. Add a 2D GUI panel attached to the left controller that has a color picker and two buttons ("cube" and "sphere"). (1)
3. When you click, create a cube or sphere as described below, with the correct color. (2)
4. Pressing the grip buttons on both controllers erases all the objects created. (1)

There will be no bonus part for this part of the assignment.

## Overview 

The goal of the assignment is to use the Playcanvas Engine to create the same immersive WebXR application you just created in the Playcanvas Editor.

This repository implements the same WebXR starter code project you used for 1(b), so you can take your solution to 1(b) and replicate the changes you made here.  

You do not need to implement additional interaction functionality beyond 1(b).  Refer to that assignment for the requirements.

One common complaint about the model used by Unity and Playcanvas is that all code must be attached to scripts.  The common result is that there are a number of scripts attached to the "Root" node, that contain global functionality.  In this sample project, that code is in the "vr.js", "object-picker.js", and "controllers.js" scripts.  

Therefore, in addition to getting your assignment running, you must restructure your code to remove those scripts and put their functionality into "index.ts".  You can continue to use Playcanvas functionality (e.g., object-picker.js uses "this.app.on('object:pick', this.pick, this);", and that is ok, since it allows scripts to communicate with code in the main code file.)

(Note: there are nice reasons to have this code separated into separate modules, even if it's not structured as a PlayCanvas "script", but we're moving it to our single code file for illustrative purposes.)

# Collaboration

You are free to discuss technical questions and issues in the Teams channels, but the code you submit should be your own.  So, please do not post large chunks of code, but providing pointers to examples or documentation pages or classes and methods, along with discussion of how to use them, is fine.

# Submission

You will check out the project from github classroom, and submit it there.  The project folder should contain just the additions to the sample project that are needed to implement the project.  Do not add extra files, and do not remove the .gitignore file (we do not want the "node_modules" directory in your repository.)

**Do Not Change the names** of the existing files (e.g., index.html, index.ts, etc).  The TAs need to be able to test your program as follows:

1. cd into the directory and run ```npm install```
2. start a local web server and compile by running ```npm run start``` and pointing the browser at your ```index.html```

Please test that your submission meets these requirements.  For example, after you check in your final version of the assignment to github, check it out again to a new directory and make sure everything builds and runs correctly.
 
# Development Environment

The sample has already been set up with a complete project for Typescript development, and includes a copy of the Playcanvas engine.

## Running 

You set up the initial project by pulling the dependencies from npm with 
```
npm install
```

After that, you can compile and run a server with:
```
npm run start
```

You do not have to run ```tsc``` to build the .js files from the .ts files;  ```npx``` builds them on the fly as part of running webpack.

You can run the sample by pointing your web browser at ```https://localhost:8080/index.html```

## License

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">Material for 3D User Interfaces Fall 2020</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="https://github.blairmacintyre.me/3dui-class-f20" property="cc:attributionName" rel="cc:attributionURL">Blair MacIntyre</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.

The intent of choosing (CC BY-NC-SA 4.0) is to allow individuals and instructors at non-profit entities to use this content.  This includes not-for-profit schools (K-12 and post-secondary). For-profit entities (or people creating courses for those sites) may not use this content without permission (this includes, but is not limited to, for-profit schools and universities and commercial education sites such as Corsera, Udacity, LinkedIn Learning, and other similar sites).   