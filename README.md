# recursio
A recursive sandbox factory simulation game:
 - The map is a grid.
 - The player is a cursor in the grid, which can place objects.
 - We need a feature for recursion. Say a cell contains a + and it means it has a subgrid which you can enter, modify and leave.
 - Primary feature: Conveyor belts. 4 choices for input edge, 3 outputs for output edge.
 - Each object has a number of uniform properties:
   - x
   - y
   - width
   - height
   - enabled
   - overspeedx (-1, 0, 1) for belts
   - overspeedy (-1, 0, 1)
   - selfspeedx (-1, 0, 1) for cars
   - selfspeedy (-1, 0, 1)
   - underspeedx (-1, 0, 1) for inverse belts
   - underspeedy (-1, 0, 1)
 - Each cell can contain a stacked number of objects. Each stack level decreases the size of the object. Maximum stack level is 8.
 - Save state to local storage to begin with. Add load/save to file functionality.
 - Map cells can contain resources. We need a mine object to mine them and output in one of 4 directions.
 - Void cell to eliminate resources.
 - An essential concept is that all objects can go on conveyor belts, including conveyor belts and factories.
 - We can have self-driving objects, i.e. cars.
 - All items have integer positions in the grid at each time tick. All which happens in between is linear interpolation based on graphics frames.
 - Might it be possible to let recursion cells operate at another tick frequency, in order to finish subtasks which can be required at a quicker rate above?
 - Figure out how to represent characters and numbers.
 - Robot arm is an essential device. It adds the following properties:
   - targetx
   - targety
   - rotationx. what about integer ticks?
   - rotationy
 - Can we represent all or most properties visually? Such as two animation states which are interpolated between?
 - All offsets can be represented by an offset shape (up arrowfor overspeed) (circle for selfspeed) (down arrow for underspeed).
 - Allow binary operators? As a factory that takes two belts as input and one output perhaps.
