import vsketch


class SeededLines(vsketch.SketchClass):
    def draw(self, vsk: vsketch.Vsketch) -> None:
        vsk.size("100mm", "80mm")
        vsk.randomSeed(1701)
        endpoint = vsk.random(10, 30)
        vsk.line(5, 5, endpoint, 5)
        vsk.line(endpoint, 5, endpoint, 25)

    def finalize(self, vsk: vsketch.Vsketch) -> None:
        pass


if __name__ == "__main__":
    SeededLines().display()
