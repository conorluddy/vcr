from manim import RED, RIGHT, Scene, Square, linear


class SquareTranslate(Scene):
    def construct(self):
        self.camera.background_color = "#FFFFFF"
        square = Square(side_length=1, stroke_width=0, fill_color=RED, fill_opacity=1)
        square.shift(RIGHT * -2)
        self.add(square)
        self.play(square.animate.shift(RIGHT * 4), run_time=0.75, rate_func=linear)
        self.wait(0.25, frozen_frame=False)
