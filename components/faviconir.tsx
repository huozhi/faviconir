"use client"

import React, { useCallback, useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Github } from 'lucide-react'

type Shape = 'circle' | 'triangle' | 'square'
type DownloadFormat = 'svg' | 'ico'

export default function Faviconir() {
  const [itemCount, setItemCount] = useState(3)
  const [shape, setShape] = useState<Shape>('circle')
  const [colorTheme, setColorTheme] = useState<{ [key: number]: string }>({})
  const [backgroundColor, setBackgroundColor] = useState<string>('')
  const [useBackground, setUseBackground] = useState(false)
  const [faviconContent, setFaviconContent] = useState<string>('')
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>('svg')
  const [positions, setPositions] = useState<Array<{x: number, y: number, size: number}>>([])


  const generateBackgroundColor = () => {
    const hue = Math.floor(Math.random() * 360)
    const saturation = Math.floor(Math.random() * 30) + 70 // 70-100%
    const lightness = Math.floor(Math.random() * 20) + 70 // 70-90%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  const regenerateSingleColor = (index: number) => {
    const hue = Math.floor(Math.random() * 360)
    const saturation = Math.floor(Math.random() * 40) + 60 // 60-100%
    const lightness = Math.floor(Math.random() * 30) + 40 // 40-70%
    setColorTheme(prev => ({ ...prev, [index]: `hsl(${hue}, ${saturation}%, ${lightness}%)` }))
  }

  const regenerateBackgroundColor = () => {
    setBackgroundColor(generateBackgroundColor())
  }

  const generatePositions = useCallback((count: number) => {
    return Array.from({ length: count }, () => ({
      x: Math.floor(Math.random() * 56),
      y: Math.floor(Math.random() * 56),
      size: Math.floor(Math.random() * 24) + 8
    }))
  }, [])

  const drawShape = (x: number, y: number, size: number, color: string) => {
    switch (shape) {
      case 'circle':
        return `<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}" fill="${color}" />`
      case 'triangle':
        return `<polygon points="${x + size / 2},${y} ${x + size},${y + size} ${x},${y + size}" fill="${color}" />`
      case 'square':
        return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}" />`
    }
  }

  const drawFavicon = useCallback(() => {
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">`

    if (useBackground) {
      svgContent += `<rect width="64" height="64" fill="${backgroundColor}" />`
    } else {
      svgContent += `<rect width="64" height="64" fill="white" />`
    }

    const colors = Object.values(colorTheme)
    positions.forEach((pos, i) => {
      const color = colors[i % colors.length]
      svgContent += drawShape(pos.x, pos.y, pos.size, color)
    })

    svgContent += '</svg>'
    setFaviconContent(svgContent)
  }, [positions, shape, colorTheme, backgroundColor, useBackground])

  const downloadFavicon = useCallback(() => {
    if (downloadFormat === 'svg') {
      const svgBlob = new Blob([faviconContent], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'favicon.svg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else {
      const canvas = document.createElement('canvas')
      canvas.width = 16
      canvas.height = 16
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 16, 16)
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = 'favicon.ico'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }, 'image/png')
      }
      img.src = 'data:image/svg+xml;base64,' + btoa(faviconContent)
    }
  }, [faviconContent, downloadFormat])

  const randomizeAll = () => {
    setItemCount(Math.floor(Math.random() * 10) + 1)
    setShape(['circle', 'triangle', 'square'][Math.floor(Math.random() * 3)] as Shape)
    const newTheme = {}
    for (let i = 0; i < 3; i++) {
      const hue = Math.floor(Math.random() * 360)
      const saturation = Math.floor(Math.random() * 40) + 60 // 60-100%
      const lightness = Math.floor(Math.random() * 30) + 40 // 40-70%
      newTheme[i] = `hsl(${hue}, ${saturation}%, ${lightness}%)`
    }
    setColorTheme(newTheme)
    setBackgroundColor(generateBackgroundColor())
    setUseBackground(Math.random() > 0.5)
    setPositions(generatePositions(itemCount))
  }

  useEffect(() => {
    const newTheme = {}
    for (let i = 0; i < 3; i++) {
      const hue = Math.floor(Math.random() * 360)
      const saturation = Math.floor(Math.random() * 40) + 60 // 60-100%
      const lightness = Math.floor(Math.random() * 30) + 40 // 40-70%
      newTheme[i] = `hsl(${hue}, ${saturation}%, ${lightness}%)`
    }
    setColorTheme(newTheme)
    setBackgroundColor(generateBackgroundColor())
  }, [])

  useEffect(() => {
    setPositions(generatePositions(itemCount))
  }, [itemCount, generatePositions])

  useEffect(() => {
    drawFavicon()
  }, [drawFavicon, itemCount, shape, colorTheme, backgroundColor, useBackground])

  return (
    <div className="min-h-screen bg-[#FFF8E1]">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-[#5D4037]">Faviconir</h1>
          <a
            href="https://github.com/huozhi/faviconir"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5D4037] hover:text-[#3E2723]"
          >
            <Github className="w-6 h-6" />
          </a>
        </div>
        <p className="text-[#5D4037] mb-8">Generate beautiful favicons with customizable shapes and colors</p>

        <div className="bg-[#FFECB3] text-[#5D4037] p-4 rounded-lg mb-8">
          <p>Create unique favicons by adjusting the number of items, shapes, colors, and background styles. Download in SVG or ICO format.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 space-y-6">
            <div className="bg-[#FFF3E0] p-6 rounded-lg shadow-sm">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="item-count" className="text-sm font-medium text-[#5D4037]">Items: {itemCount}</Label>
                  <Slider
                    id="item-count"
                    min={1}
                    max={10}
                    step={1}
                    value={[itemCount]}
                    onValueChange={(value) => setItemCount(value[0])}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="shape" className="text-sm font-medium text-[#5D4037]">Shape</Label>
                  <Select value={shape} onValueChange={(value: Shape) => setShape(value)}>
                    <SelectTrigger id="shape" className="w-full">
                      <SelectValue placeholder="Select shape" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circle">Circle</SelectItem>
                      <SelectItem value="triangle">Triangle</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="color-theme" className="text-sm font-medium text-[#5D4037]">Color Theme</Label>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((index) => (
                      <button
                        key={index}
                        className="w-6 h-6 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB300] border border-white"
                        style={{ backgroundColor: colorTheme[index] }}
                        onClick={() => regenerateSingleColor(index)}
                        aria-label={`Regenerate theme color ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="background" className="text-sm font-medium text-[#5D4037]">Background</Label>
                  <div className="flex items-center gap-2">
                    <button
                      className="w-6 h-6 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB300] border border-white"
                      style={{ backgroundColor: backgroundColor }}
                      onClick={regenerateBackgroundColor}
                      aria-label="Regenerate background color"
                    />
                    <Switch
                      id="use-background"
                      checked={useBackground}
                      onCheckedChange={setUseBackground}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Button onClick={() => setPositions(generatePositions(itemCount))} className="w-full bg-[#FFD54F] text-[#5D4037] hover:bg-[#FFECB3]">
                    Reposition
                  </Button>
                  <Button onClick={randomizeAll} className="w-full bg-[#FFD54F] text-[#5D4037] hover:bg-[#FFECB3]">
                    Randomize All
                  </Button>
                  <div className="flex gap-2">
                    <Select value={downloadFormat} onValueChange={(value: DownloadFormat) => setDownloadFormat(value)}>
                      <SelectTrigger id="download-format" className="w-full">
<SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="svg">SVG</SelectItem>
                        <SelectItem value="ico">ICO</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={downloadFavicon} 
                      disabled={!faviconContent}
                      className="w-full bg-[#FFB300] text-white hover:bg-[#FFA000] disabled:bg-gray-400"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/3 flex flex-col items-center justify-center">
            <div 
              className={`w-64 h-64 ${useBackground ? 'bg-[#FFF3E0]' : 'bg-white'} border-4 border-white rounded-lg shadow-sm mb-4 flex items-center justify-center overflow-hidden`}
              aria-label="Favicon preview"
            >
              <div 
                dangerouslySetInnerHTML={{ __html: faviconContent.replace('width="64" height="64"', 'width="256" height="256"') }}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

