import { CommonModule } from '@angular/common';
import { Component, signal, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import Konva from 'konva';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: []
})
export class App implements AfterViewInit {

  // ------------------------------
  // UI STATE
  // ------------------------------
  colors = [
    'bg-[#000000]', 'bg-[#6b7280]', 'bg-[#b91c1c]', 'bg-[#f97316]', 'bg-[#eab308]', 'bg-[#84cc16]', 'bg-[#22c55e]', 'bg-[#06b6d4]', 'bg-[#2563eb]', 'bg-[#9333ea]',
    'bg-[#ffffff]', 'bg-[#d1d5db]', 'bg-[#d97706]', 'bg-[#f472b6]', 'bg-[#fde047]', 'bg-[#d9f99d]', 'bg-[#5eead4]', 'bg-[#7dd3fc]', 'bg-[#818cf8]', 'bg-[#c4b5fd]'
  ];

  selectedShape = signal('');
  selectedColor = signal('bg-[#000000]');
  selectShape(shape: string) { this.selectedShape.set(this.selectedShape() === shape ? '' : shape); }
  selectColor(color: string) { this.selectedColor.set(color); }

  // ------------------------------
  // KONVA STATE
  // ------------------------------
  private stage!: Konva.Stage;
  private layer!: Konva.Layer;
  private previewLayer!: Konva.Layer;

  private startX = 0; private startY = 0;
  private endX = 0; private endY = 0;
  private isDrawing = false;


  private isKonvaInitialized = false;

  @ViewChild('canvasContainer') container!: ElementRef;

  ngAfterViewInit() {
    this.initializeKonva();
  }
  private initializeKonva() {
    if (this.isKonvaInitialized) return;
    this.isKonvaInitialized = true;

    const width = this.container.nativeElement.offsetWidth;
    const height = this.container.nativeElement.offsetHeight;

    this.stage = new Konva.Stage({ container: this.container.nativeElement, width, height });
    this.layer = new Konva.Layer();
    this.previewLayer = new Konva.Layer();
    this.stage.add(this.layer);
    this.stage.add(this.previewLayer);

    this.stage.on('mousedown', e => this.onMouseDown(e));
    this.stage.on('mouseup', e => this.onMouseUp(e));
    this.stage.on('mousemove', e => this.onMouseMove(e));

  }

  // ------------------------------
  // MOUSE EVENTS
  // ------------------------------
  private onMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    if (!this.selectedShape()) return;
    const pos = this.stage.getPointerPosition()!;
    this.startX = this.endX = pos.x;
    this.startY = this.endY = pos.y;
    this.isDrawing = true;
  }

  private onMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    if (!this.isDrawing) return;
    const pos = this.stage.getPointerPosition()!;
    this.endX = pos.x; this.endY = pos.y;

    this.previewLayer.destroyChildren();
    this.drawShape(this.previewLayer, true);
  }

  private onMouseUp(e: Konva.KonvaEventObject<MouseEvent>) {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    const pos = this.stage.getPointerPosition()!;
    this.endX = pos.x; this.endY = pos.y;

    this.drawShape(this.layer);
    this.previewLayer.destroyChildren();


  }


  // ------------------------------
  // DRAW SHAPES
  // ------------------------------
  private drawShape(layer: Konva.Layer, isPreview = false) {
    const x = Math.min(this.startX, this.endX);
    const y = Math.min(this.startY, this.endY);
    const width = Math.abs(this.endX - this.startX);
    const height = Math.abs(this.endY - this.startY);

    const fill = this.selectedColor().replace('bg-[', '').replace(']', '');
    const stroke = '#000000';
    const strokeWidth = 3;

    const shape = this.selectedShape();

    // RECTANGLE / SQUARE
    if (shape === 'rectangle' || shape === 'square') {
      const side = Math.min(width, height);
      layer.add(new Konva.Rect({
        x, y,
        width: shape === 'square' ? side : width,
        height: shape === 'square' ? side : height,
        fill, stroke, strokeWidth
      }));
    }

    // CIRCLE / ELLIPSE
    else if (shape === 'circle' || shape === 'ellipse') {
      const cx = x + width / 2;
      const cy = y + height / 2;

      if (shape === 'circle') {
        layer.add(new Konva.Circle({ x: cx, y: cy, radius: Math.min(width, height) / 2, fill, stroke, strokeWidth }));
      } else {
        layer.add(new Konva.Ellipse({ x: cx, y: cy, radiusX: width / 2, radiusY: height / 2, fill, stroke, strokeWidth }));
      }
    }

    // POLYGONS
    else if (shape === 'triangle' || shape === 'pentagon' || shape === 'hexagon') {
      const sides = shape === 'triangle' ? 3 : shape === 'pentagon' ? 5 : 6;
      const cx = x + width / 2;
      const cy = y + height / 2;
      layer.add(new Konva.RegularPolygon({ x: cx, y: cy, sides, radius: Math.min(width, height) / 2, fill, stroke, strokeWidth }));
    }

    // DIAMOND
    else if (shape === 'diamond') {
      const cx = (this.startX + this.endX) / 2;
      const cy = (this.startY + this.endY) / 2;
      const w = Math.abs(this.endX - this.startX) / 2;
      const h = Math.abs(this.endY - this.startY) / 2;

      layer.add(new Konva.Line({
        points: [cx, cy - h, cx + w, cy, cx, cy + h, cx - w, cy],
        fill, stroke, strokeWidth, closed: true
      }));
    }

    // LINE
    else if (shape === 'line') {
      const stroke =this.selectedColor().replace('bg-[', '').replace(']', '');
      layer.add(new Konva.Line({
        points: [this.startX, this.startY, this.endX, this.endY],
        stroke, strokeWidth: 5, lineCap: 'round', lineJoin: 'round'
      }));
    }

    layer.draw();
  }
}
