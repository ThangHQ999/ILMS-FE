'use client';

import { useCallback } from 'react';
import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCollide,
  forceCenter,
  SimulationNodeDatum,
  SimulationLinkDatum,
} from 'd3-force';
import type { Node, Edge } from '@xyflow/react';
import { KnowledgeNodeData, LayoutMode } from '../types';

interface SimNode extends SimulationNodeDatum {
  id: string;
  data: KnowledgeNodeData;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
}

export function useForceLayout() {
  const applyLayout = useCallback(
    (
      nodes: Node<KnowledgeNodeData>[],
      edges: Edge[],
      mode: LayoutMode = 'force',
      width: number = 1000,
      height: number = 650
    ): Node<KnowledgeNodeData>[] => {
      if (!nodes || nodes.length === 0) return [];

      const centerX = width / 2;
      const centerY = height / 2;

      if (mode === 'circular') {
        // Cụm xoay tròn: Centerpiece ở giữa, các node khác chia thành 2 vòng tròn
        const centerpiece = nodes.find((n) => n.data.isCenterpiece) || nodes[0];
        const innerNodes = nodes.filter(
          (n) =>
            n.id !== centerpiece.id &&
            (edges.some(
              (e) =>
                (e.source === centerpiece.id && e.target === n.id) ||
                (e.target === centerpiece.id && e.source === n.id)
            ) ||
              n.data.status === 'learning')
        );
        const outerNodes = nodes.filter(
          (n) => n.id !== centerpiece.id && !innerNodes.some((inNode) => inNode.id === n.id)
        );

        return nodes.map((node) => {
          if (node.id === centerpiece.id) {
            return {
              ...node,
              position: { x: centerX - 40, y: centerY - 40 },
            };
          }

          const isInner = innerNodes.some((inNode) => inNode.id === node.id);
          if (isInner) {
            const idx = innerNodes.findIndex((inNode) => inNode.id === node.id);
            const angle = (idx / Math.max(1, innerNodes.length)) * 2 * Math.PI;
            const r = 240;
            return {
              ...node,
              position: {
                x: Math.round(centerX + r * Math.cos(angle) - 35),
                y: Math.round(centerY + r * Math.sin(angle) - 35),
              },
            };
          } else {
            const idx = outerNodes.findIndex((outNode) => outNode.id === node.id);
            const angle = (idx / Math.max(1, outerNodes.length)) * 2 * Math.PI;
            const r = 440;
            return {
              ...node,
              position: {
                x: Math.round(centerX + r * Math.cos(angle) - 35),
                y: Math.round(centerY + r * Math.sin(angle) - 35),
              },
            };
          }
        });
      }

      if (mode === 'hierarchical') {
        // Phân cấp DAG theo 4 tầng (Tầng 1: Tiên quyết -> Tầng 2: Cốt lõi -> Tầng 3: Mở rộng -> Tầng 4: Ứng dụng/Chuẩn)
        const tier1 = nodes.filter(
          (n) => n.data.status === 'prerequisite' || n.id === 'prefix-sum' || n.id === 'bst'
        );
        const tier2 = nodes.filter((n) => n.data.isCenterpiece || n.id === 'seg-tree');
        const tier3 = nodes.filter(
          (n) =>
            !tier1.some((t) => t.id === n.id) &&
            !tier2.some((t) => t.id === n.id) &&
            (n.data.category === 'algo' || n.data.category === 'ds')
        );
        const tier4 = nodes.filter(
          (n) =>
            !tier1.some((t) => t.id === n.id) &&
            !tier2.some((t) => t.id === n.id) &&
            !tier3.some((t) => t.id === n.id)
        );

        const tiers = [tier1, tier2, tier3, tier4];
        const tierSpacingX = (width - 160) / 4;

        const updatedNodes: Node<KnowledgeNodeData>[] = [];
        tiers.forEach((tierGroup, tierIdx) => {
          const x = 80 + tierIdx * tierSpacingX;
          const count = tierGroup.length;
          const spacingY = Math.min(130, (height - 120) / Math.max(1, count));
          const startY = (height - (count - 1) * spacingY) / 2;

          tierGroup.forEach((node, nodeIdx) => {
            updatedNodes.push({
              ...node,
              position: {
                x: Math.round(x),
                y: Math.round(startY + nodeIdx * spacingY),
              },
            });
          });
        });

        return updatedNodes;
      }

      // Default: Force-Directed Layout bằng d3-force
      const simNodes: SimNode[] = nodes.map((n) => ({
        id: n.id,
        x: n.position?.x ?? centerX + (Math.random() - 0.5) * 200,
        y: n.position?.y ?? centerY + (Math.random() - 0.5) * 200,
        data: n.data,
      }));

      const simLinks: SimLink[] = edges.map((e) => ({
        source: e.source,
        target: e.target,
      }));

      const simulation = forceSimulation<SimNode>(simNodes)
        .force('charge', forceManyBody().strength(-420))
        .force(
          'link',
          forceLink<SimNode, SimLink>(simLinks)
            .id((d) => d.id)
            .distance(150)
            .strength(0.6)
        )
        .force('collide', forceCollide().radius(75).strength(0.85))
        .force('center', forceCenter(centerX, centerY).strength(0.08));

      // Ghim vị trí node trọng tâm gần giữa
      const centerpieceNode = simNodes.find((n) => n.data.isCenterpiece);
      if (centerpieceNode) {
        centerpieceNode.x = centerX;
        centerpieceNode.y = centerY;
      }

      // Chạy tính toán trước (static synchronous simulation)
      simulation.tick(160);
      simulation.stop();

      const positionMap = new Map<string, { x: number; y: number }>();
      simNodes.forEach((sn) => {
        if (typeof sn.x === 'number' && typeof sn.y === 'number') {
          // Bounding clamp vào khoảng kích thước
          const clampedX = Math.max(60, Math.min(width - 100, sn.x));
          const clampedY = Math.max(60, Math.min(height - 100, sn.y));
          positionMap.set(sn.id, {
            x: Math.round(clampedX),
            y: Math.round(clampedY),
          });
        }
      });

      return nodes.map((node) => ({
        ...node,
        position: positionMap.get(node.id) || node.position,
      }));
    },
    []
  );

  return { applyLayout };
}
