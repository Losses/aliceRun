import {
   WebGLRenderTarget,
   ShaderMaterial,
   Vector2,
   HalfFloatType,
   type WebGLRenderer,
   type Scene,
   type Camera
} from 'three';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass';
import { EasuShader } from './EasuShader';
import { RcasShader } from './RcasShader';

interface FSRPassOptions {
   sharpness?: number;
}

class RenderFSRPass extends Pass {
   private downSampleAmount: number;
   private resolution: Vector2;
   private renderResolution: Vector2;
   private easuMaterial: ShaderMaterial;
   private rcasMaterial: ShaderMaterial;
   private fsQuad: FullScreenQuad;
   private scene: Scene;
   private camera: Camera;
   private sharpness: number;
   private renderTargetA: WebGLRenderTarget;
   private renderTargetB: WebGLRenderTarget;

   constructor(downSampleAmount: number, scene: Scene, camera: Camera, options: FSRPassOptions = {}) {
      super();

      this.downSampleAmount = downSampleAmount;
      this.resolution = new Vector2();
      this.renderResolution = new Vector2();

      this.easuMaterial = new ShaderMaterial(EasuShader);
      this.rcasMaterial = new ShaderMaterial(RcasShader);

      this.fsQuad = new FullScreenQuad(this.easuMaterial);
      this.scene = scene;
      this.camera = camera;

      this.sharpness = options.sharpness || 0.2;

      this.renderTargetA = new WebGLRenderTarget(1, 1, {
         type: HalfFloatType
      });
      this.renderTargetB = new WebGLRenderTarget(1, 1, {
         type: HalfFloatType
      });
   }

   dispose(): void {
      this.renderTargetA.dispose();
      this.renderTargetB.dispose();
      this.easuMaterial.dispose();
      this.rcasMaterial.dispose();
      this.fsQuad.dispose();
   }

   setSize(width: number, height: number): void {
      this.resolution.set(width, height);
      this.renderResolution.set((width / this.downSampleAmount) | 0, (height / this.downSampleAmount) | 0);
      const { x, y } = this.renderResolution;
      this.renderTargetA.setSize(x, y);
      this.renderTargetB.setSize(x, y);
      this.easuMaterial.uniforms.iResolution.value.set(x, y, 1 / x, 1 / y);
      this.rcasMaterial.uniforms.iResolution.value.set(width, height, 1 / width, 1 / height);
   }

   setDownSampleAmount(downSampleAmount: number): void {
      this.downSampleAmount = downSampleAmount;
      this.setSize(this.resolution.x, this.resolution.y);
   }

   render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget | null): void {
      const easuUniforms = this.easuMaterial.uniforms;
      const rcasUniforms = this.rcasMaterial.uniforms;

      easuUniforms.iResolution.value.set(this.renderResolution.x, this.renderResolution.y, 1 / this.renderResolution.x, 1 / this.renderResolution.y);
      rcasUniforms.iResolution.value.set(this.resolution.x, this.resolution.y, 1 / this.resolution.x, 1 / this.resolution.y);
      rcasUniforms.sharpness.value = this.sharpness;

      // Render scene to renderTargetA
      renderer.setRenderTarget(this.renderTargetA);
      renderer.render(this.scene, this.camera);

      // Use renderTargetA as input for EASU pass
      easuUniforms.tDiffuse.value = this.renderTargetA.texture;

      // Render EASU pass to renderTargetB
      this.fsQuad.material = this.easuMaterial;
      renderer.setRenderTarget(this.renderTargetB);
      this.fsQuad.render(renderer);

      // Use renderTargetB as input for RCAS pass
      rcasUniforms.tDiffuse.value = this.renderTargetB.texture;

      // Render RCAS pass to either screen or writeBuffer
      this.fsQuad.material = this.rcasMaterial;

      if (this.renderToScreen) {
         renderer.setRenderTarget(null);
      } else {
         renderer.setRenderTarget(writeBuffer);
         if (this.clear) renderer.clear();
      }

      this.fsQuad.render(renderer);
   }
}

export { RenderFSRPass };