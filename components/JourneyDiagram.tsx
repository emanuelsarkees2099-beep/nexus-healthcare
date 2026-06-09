'use client'
import { useEffect, useRef, useState } from 'react'
import { MessageQuestion, SearchNormal1, TickCircle, Map1, Hospital, MedalStar } from 'iconsax-react'

type IconComponent = React.ComponentType<{ size?: number; color?: string; variant?: 'Bold' | 'Linear' | 'Outline' | 'Broken' | 'Bulk' | 'TwoTone' }>

type Node = {
  id: string
  label: string
  sublabel: string
  x: number
  y: number
  color: string
  Icon: IconComponent
}

const NODES: Node[] = [
  { id: 'symptom',  label: 'Symptom',         sublabel: 'You notice something',       x: 80,  y: 50,  color: '#fbbf24', Icon: MessageQuestion },
  { id: 'search',   label: 'Search',           sublabel: 'Find care options',          x: 240, y: 50,  color: '#818cf8', Icon: SearchNormal1 },
  { id: 'match',    label: 'Match',            sublabel: 'AI finds best clinic',       x: 400, y: 50,  color: '#60a5fa', Icon: TickCircle },
  { id: 'navigate', label: 'Navigate',         sublabel: 'GPS guides you there',       x: 560, y: 50,  color: '#38bdf8', Icon: Map1 },
  { id: 'care',     label: 'Receive Care',     sublabel: 'Seen by a provider',         x: 720, y: 50,  color: '#f472b6', Icon: Hospital },
  { id: 'outcome',  label: 'Outcome',          sublabel: 'You track & share',          x: 880, y: 50,  color: '#4a90d9', Icon: MedalStar },
]

const CONNECTIONS = [
  ['symptom', 'search'],
  ['search', 'match'],
  ['match', 'navigate'],
  ['navigate', 'care'],
  ['care', 'outcome'],
]

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

export default function JourneyDiagram() {
  const [activeNode, setActiveNode] = useState(-1)
  const [animated, setAnimated] = useState(false)
  const [liveCount, setLiveCount] = useState(247)
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setAnimated(true); obs.disconnect() }
    }, { threshold: 0.3 })
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!animated) return
    let idx = -1
    const interval = setInterval(() => {
      idx = (idx + 1) % NODES.length
      setActiveNode(idx)
    }, 900)
    return () => clearInterval(interval)
  }, [animated])

  useEffect(() => {
    const t = setInterval(() => {
      setLiveCount(c => {
        const delta = Math.random() > 0.5 ? 1 : -1
        return Math.max(230, Math.min(280, c + delta))
      })
    }, 2000)
    return () => clearInterval(t)
  }, [])

  const svgW = 960
  const svgH = 160

  return (
    <div ref={containerRef} style={{ width: '100%', overflowX: 'auto', paddingBottom: '16px' }}>
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
        marginBottom: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)',
      }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#60a5fa', display: 'inline-block', animation: 'live-dot 1.5s ease-in-out infinite' }} />
        <span>
          <strong style={{ color: '#f5f5f5' }}>{liveCount}</strong> people are navigating this journey right now
        </span>
      </div>

      <style>{`@keyframes live-dot { 0%,100%{opacity:1} 50%{opacity:0.3} } @keyframes dash-flow { to { stroke-dashoffset: -20; } }`}</style>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ width: '100%', minWidth: '680px', display: 'block' }}
        aria-label="Patient journey from symptom to care outcome"
      >
        {/* Connection lines */}
        {CONNECTIONS.map(([fromId, toId], i) => {
          const from = NODES.find(n => n.id === fromId)!
          const to = NODES.find(n => n.id === toId)!
          const fromIdx = NODES.findIndex(n => n.id === fromId)
          const isActive = animated && activeNode >= fromIdx

          return (
            <g key={`${fromId}-${toId}`}>
              {/* Base line */}
              <line
                x1={from.x + 36} y1={from.y + 24}
                x2={to.x - 4} y2={to.y + 24}
                stroke="rgba(255,255,255,0.07)" strokeWidth="1.5"
              />
              {/* Active flowing line */}
              {isActive && (
                <line
                  x1={from.x + 36} y1={from.y + 24}
                  x2={to.x - 4} y2={to.y + 24}
                  stroke={from.color}
                  strokeWidth="2"
                  strokeOpacity={0.6}
                  strokeDasharray="8 6"
                  style={{ animation: 'dash-flow 0.8s linear infinite' }}
                />
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {NODES.map((node, i) => {
          const isActive = animated && i === activeNode
          const isPast = animated && i < activeNode
          const NodeIcon = node.Icon

          return (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              {/* Glow when active */}
              {isActive && (
                <circle
                  cx={20} cy={24} r="28"
                  fill={node.color} fillOpacity="0.12"
                  style={{ animation: 'live-dot 0.9s ease-in-out infinite' }}
                />
              )}
              {/* Node circle */}
              <circle
                cx={20} cy={24} r="20"
                fill={isPast || isActive ? `${node.color}20` : 'rgba(255,255,255,0.04)'}
                stroke={isPast || isActive ? node.color : 'rgba(255,255,255,0.12)'}
                strokeWidth={isActive ? 2 : 1}
                style={{ transition: 'all 0.5s' }}
              />
              {/* Icon via foreignObject — embeds React component inside SVG */}
              <foreignObject x={10} y={14} width="20" height="20">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}>
                  <NodeIcon
                    size={14}
                    color={isPast || isActive ? node.color : 'rgba(255,255,255,0.35)'}
                    variant="TwoTone"
                  />
                </div>
              </foreignObject>
              {/* Labels */}
              <text
                x={20} y={60}
                textAnchor="middle"
                fontSize="11" fontWeight="600"
                fill={isPast || isActive ? node.color : 'rgba(255,255,255,0.45)'}
                style={{ fontFamily: 'var(--font-inter)', transition: 'fill 0.5s' }}
              >
                {node.label}
              </text>
              <text
                x={20} y={74}
                textAnchor="middle"
                fontSize="9"
                fill="rgba(255,255,255,0.3)"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {node.sublabel}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
