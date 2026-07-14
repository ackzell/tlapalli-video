import { Camera, CameraProps, Node } from "@motion-canvas/2d";
import { SignalValue } from "@motion-canvas/core";
import { computed } from "@motion-canvas/2d/lib/decorators";

export class FixedCamera extends Camera {
  public constructor(props: CameraProps) {
    super(props);
    const scene = this.scene();
    if (scene && scene.parent() !== this) {
      scene.parent(this);
    }
  }

  protected setScene(value: SignalValue<Node>) {
    const previous = this.scene.context.raw();
    this.scene.context.setter(value);
    const current = this.scene.context.raw();
    if (previous instanceof Node && previous !== current) {
      previous.parent(null);
    }
    if (current instanceof Node && current.parent() !== this) {
      current.parent(this);
    }
  }

  @computed()
  public override localToWorld(): DOMMatrix {
    const parent = this.parent();
    const matrix = this.localToParent().inverse();
    return parent ? parent.localToWorld().multiply(matrix) : matrix;
  }

  /**
   * Override parentToWorld to fix gizmo drawing; may have side effects on the absolute position.
   */
  @computed()
  public override parentToWorld(): DOMMatrix {
    return this.localToParent();
  }

  protected override drawChildren(context: CanvasRenderingContext2D) {
    this.scene().render(context);
  }
}
