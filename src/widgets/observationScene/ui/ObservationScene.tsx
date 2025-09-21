import { useEffect, useRef } from 'react';
import { useSimulation } from '../../../app/providers/SimulationProvider';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../../shared/constants/simulation';
import type { Organism } from '../../../entities/organism/model/types';
import type { Predator } from '../../../entities/predator/model/types';
import './observation-scene.css';

const drawOrganism = (ctx: CanvasRenderingContext2D, organism: Organism) => {
  ctx.save();
  ctx.translate(organism.position.x, organism.position.y);
  if (organism.status === 'mutating') {
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, organism.size * 1.8);
    glow.addColorStop(0, `${organism.traits.color}AA`);
    glow.addColorStop(1, '#ffffff00');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, organism.size * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  if (organism.status === 'evading') {
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#5dade2aa';
  }

  ctx.fillStyle = organism.traits.color;
  ctx.strokeStyle = '#0b0f1a';
  ctx.lineWidth = 1.2;

  switch (organism.traits.shape) {
    case 'amoeba': {
      ctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const angle = (Math.PI * 2 * i) / 6;
        const radius = organism.size + Math.sin(organism.age + i) * 4;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.quadraticCurveTo(x, y, x, y);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'spike': {
      ctx.beginPath();
      const spikes = 12;
      const outer = organism.size * 1.2;
      const inner = organism.size * 0.6;
      for (let i = 0; i < spikes * 2; i += 1) {
        const radius = i % 2 === 0 ? outer : inner;
        const angle = (Math.PI * i) / spikes;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    default: {
      ctx.beginPath();
      ctx.arc(0, 0, organism.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(-organism.size * 0.3, -organism.size * 0.4, organism.size * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff22';
  ctx.fill();

  ctx.restore();
};

const drawPredator = (ctx: CanvasRenderingContext2D, predator: Predator) => {
  ctx.save();
  ctx.translate(predator.position.x, predator.position.y);

  const ripple = ctx.createRadialGradient(0, 0, predator.size * 0.3, 0, 0, predator.size * 1.4);
  ripple.addColorStop(0, '#2ecc7140');
  ripple.addColorStop(1, '#ffffff00');
  ctx.fillStyle = ripple;
  ctx.beginPath();
  ctx.arc(0, 0, predator.size * 1.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 20;
  ctx.shadowColor = predator.behavior === 'agile' ? '#ff9ff3aa' : '#5dade2aa';
  ctx.fillStyle = predator.behavior === 'agile' ? '#ff6b81' : '#1abc9c';
  ctx.beginPath();
  ctx.ellipse(0, 0, predator.size, predator.size * 0.6, Math.sin(predator.age) * 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

const drawEnvironmentOverlay = (
  ctx: CanvasRenderingContext2D,
  params: { temperature: number; oxygen: number; acidity: number; eventName?: string }
) => {
  ctx.save();
  ctx.fillStyle = '#0b0f1a66';
  ctx.fillRect(12, 12, 215, params.eventName ? 120 : 90);
  ctx.fillStyle = '#d6f3ff';
  ctx.font = '14px "Segoe UI", sans-serif';
  ctx.fillText(`温度: ${params.temperature.toFixed(1)}℃`, 24, 40);
  ctx.fillText(`酸素: ${(params.oxygen * 100).toFixed(0)}%`, 24, 62);
  ctx.fillText(`pH: ${params.acidity.toFixed(1)}`, 24, 84);
  if (params.eventName) {
    ctx.fillStyle = '#ff9ff3';
    ctx.fillText(`イベント: ${params.eventName}`, 24, 106);
  }
  ctx.restore();
};

const renderScene = (
  canvas: HTMLCanvasElement,
  organisms: Organism[],
  predators: Predator[],
  environment: { temperature: number; oxygen: number; acidity: number; event?: { name: string } }
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, '#06162b');
  gradient.addColorStop(1, '#02070f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  predators.forEach((predator) => drawPredator(ctx, predator));
  organisms.forEach((organism) => drawOrganism(ctx, organism));
  drawEnvironmentOverlay(ctx, {
    temperature: environment.temperature,
    oxygen: environment.oxygen,
    acidity: environment.acidity,
    eventName: environment.event?.name
  });
};

export const ObservationScene = () => {
  const { organisms, predators, environment, advance } = useSimulation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animationFrame = 0;
    let last = performance.now();

    const loop = (time: number) => {
      const delta = Math.min(1.5, (time - last) / 1000);
      last = time;
      advance(delta);
      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [advance]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderScene(canvas, organisms, predators, environment);
  }, [organisms, predators, environment]);

  return (
    <div className="observation-scene">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
    </div>
  );
};
