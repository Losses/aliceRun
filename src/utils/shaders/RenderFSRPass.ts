import {
   WebGLRenderTarget,
   ShaderMaterial,
   Vector2,
   HalfFloatType,
   type WebGLRenderer,
   type Scene,
   type Camera,
   LinearSRGBColorSpace,
   SRGBColorSpace
} from 'three';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass';
import { EasuShader } from './EasuShader';
import { RcasShader } from './RcasShader';

interface FSRPassOptions {
   sharpness?: number;
}

class RenderFSRPass extends Pass {
   private _downSampleAmount = 0;
   private resolution = new Vector2();
   private renderResolution = new Vector2();
   private easuMaterial = new ShaderMaterial(EasuShader);;
   private rcasMaterial = new ShaderMaterial(RcasShader);
   private fsQuad = new FullScreenQuad(this.easuMaterial);
   private _sharpness = 0;
   private lowResolutionTarget = new WebGLRenderTarget(1, 1, {
      type: HalfFloatType,
      colorSpace: LinearSRGBColorSpace // Ensure linear color space
   });;
   private highResolutionTarget = new WebGLRenderTarget(1, 1, {
      type: HalfFloatType,
      colorSpace: LinearSRGBColorSpace // Ensure linear color space
   });;

   constructor(downSampleAmount: number, private scene: Scene, private camera: Camera, options: FSRPassOptions = {}) {
      super();

      this.sharpness = options.sharpness || 0.2;
      this.downSampleAmount = downSampleAmount;
   }

   get sharpness() {
      return this._sharpness;
   }

   set sharpness(x) {
      this._sharpness = x;
      this.rcasMaterial.uniforms.sharpness.value = x;
   }

   dispose(): void {
      this.lowResolutionTarget.dispose();
      this.highResolutionTarget.dispose();
      this.easuMaterial.dispose();
      this.rcasMaterial.dispose();
      this.fsQuad.dispose();
   }

   setSize(width: number, height: number): void {
      this.resolution.set(width, height);
      this.renderResolution.set((width / this.downSampleAmount) | 0, (height / this.downSampleAmount) | 0);
      const { x: renderX, y: renderY } = this.renderResolution;
      this.lowResolutionTarget.setSize(renderX, renderY);
      this.highResolutionTarget.setSize(width, height);

      const easuUniforms = this.easuMaterial.uniforms;
      const rcasUniforms = this.rcasMaterial.uniforms;
      (easuUniforms.iResolution.value as Vector2).set(this.resolution.x, this.resolution.y);
      (rcasUniforms.iResolution.value as Vector2).set(this.resolution.x, this.resolution.y);
   }

   get downSampleAmount() {
      return this._downSampleAmount;
   }

   set downSampleAmount(downSampleAmount: number) {
      this._downSampleAmount = downSampleAmount;
      this.setSize(this.resolution.x, this.resolution.y);
   }

   render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget | null): void {
      const easuUniforms = this.easuMaterial.uniforms;
      const rcasUniforms = this.rcasMaterial.uniforms;

      // Render scene to lowResolutionTarget
      renderer.setRenderTarget(this.lowResolutionTarget);
      renderer.render(this.scene, this.camera);

      // Use lowResolutionTarget as input for EASU pass
      easuUniforms.tDiffuse.value = this.lowResolutionTarget.texture;

      // Render EASU pass to highResolutionTarget
      this.fsQuad.material = this.easuMaterial;
      renderer.setRenderTarget(this.highResolutionTarget);
      this.fsQuad.render(renderer);

      // Use highResolutionTarget as input for RCAS pass
      rcasUniforms.tDiffuse.value = this.highResolutionTarget.texture;

      // Render RCAS pass to either screen or writeBuffer
      this.fsQuad.material = this.rcasMaterial;

      if (this.renderToScreen) {
         renderer.setRenderTarget(null);
         renderer.outputColorSpace = SRGBColorSpace; // Ensure gamma correction when rendering to screen
      } else {
         renderer.setRenderTarget(writeBuffer);
         renderer.outputColorSpace = LinearSRGBColorSpace; // Ensure linear color space for intermediate render targets
         if (this.clear) renderer.clear();
      }

      this.fsQuad.render(renderer);
   }
}

export { RenderFSRPass };