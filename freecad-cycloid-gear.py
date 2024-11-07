import math
import numpy as np
import FreeCAD as App
import Part
import Sketcher


pin_radius = 1.6
pin_circle_radius = 25.4 
number_of_pins = 28
contraction = 0.2

# 11,60,15,2  -> dist=52, offset=2 
# 11,60,15,1  -> dist=52, offset=3
# 11,50,11,1  -> dist=41, offset=3.5
# 11,50,11,2  -> dist=41, offset=2.5  (second prototype)

# 1.5,30,37,0.1 -> dist=28.4, offset=0.7
# 1.5,30,36,0.1 -> dist=28.35, offset=0.75

# 1.6,20,28,0.2 -> dist=18.6   offset=0.5
# 1.6,25.4,28,0.2 -> dist=23.6   offset=0.7

resolution = 10

# the circumference of the rolling circle needs to be exactly equal to the pitch of the pins
# rolling circle circumference = circumference of pin circle / number of pins
rolling_circle_radius = pin_circle_radius / number_of_pins 
reduction_ratio = number_of_pins - 1 # reduction ratio (+1 for internal gear)
cycloid_base_radius = reduction_ratio * rolling_circle_radius # base circle diameter of cycloidal disk
eccentricity = rolling_circle_radius - contraction


def cos(angle):
    return math.cos(math.radians(angle))

def sin(angle):
    return math.sin(math.radians(angle))

def drange(start, stop, step):
    r = start
    while r <= stop:
        yield r
        r += step


doc = App.ActiveDocument  
sketch = doc.addObject("Sketcher::SketchObject", "Sketch")

last_point = None
first_point = None

#for angle in drange(0, 360/reduction_ratio, 2.0):
for angle in drange(0, 359.999, 360.0/(number_of_pins-1)/resolution):
    x =  (cycloid_base_radius - rolling_circle_radius) * cos(angle)
    y =  (cycloid_base_radius - rolling_circle_radius) * sin(angle)

    point_x = x + (rolling_circle_radius - contraction) * cos(number_of_pins * angle) # -angle for internal gear
    point_y = y + (rolling_circle_radius - contraction) * sin(number_of_pins * angle)

    if last_point is None:
        last_point = [point_x, point_y]
        first_point = [point_x, point_y]
        continue

    sketch.addGeometry(Part.LineSegment(App.Vector(last_point[0], last_point[1], 0),
                                            App.Vector(point_x, point_y, 0)), False)

    last_point = [point_x, point_y]

sketch.addGeometry(Part.LineSegment(App.Vector(last_point[0], last_point[1], 0),
                                       App.Vector(first_point[0], first_point[1], 0)), False)


doc.recompute()
