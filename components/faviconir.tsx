"use client"

import React, { useCallback, useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Github, Circle, Square, X, Download } from 'lucide-react'
import { HexColorPicker } from "react-colorful"
import { toast } from "@/hooks/use-toast"

type Shape = 'emoji' | 'circle' | 'square'
type DownloadFormat = 'svg' | 'ico'
type ClipPath = 'none' | 'circle' | 'square'

const emojiOptions = ['😊', '🚀', '🌈', '🎉', '🔥', '💡', '🌟', '🍕']

export default function Faviconir() {
  const [itemCount, setItemCount] = useState(3)
  const [shape, setShape] = useState<Shape>('circle')
  const [colorTheme, setColorTheme] = useState<{ [key: number]: string }>({
    0: '',
    1: '',
    2: '' // This will be used for the background color
  })
  const [faviconContent, setFaviconContent] = useState<string>('')
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>('svg')
  const [positions, setPositions] = useState<Array<{x: number, y: number, size: number, angle: number}>>([])
  const [selectedEmoji, setSelectedEmoji] = useState<string>('😊');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [clipPath, setClipPath] = useState<ClipPath>('circle');
  const [colorPickerType, setColorPickerType] = useState<'theme'>('theme');
  const [colorPickerIndex, setColorPickerIndex] = useState(0);
  const [emojiSelectorOpen, setEmojiSelectorOpen] = useState(false);
  const [customEmoji, setCustomEmoji] = useState('');
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const emojiSelectorRef = useRef<HTMLDivElement>(null);

  const generateRandomPosition = (size: number, max: number) => {
    return Math.floor(Math.random() * (max - size))
  }

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

  const generatePositions = useCallback((count: number) => {
    if (count === 1 && shape === 'emoji') {
      return [{ x: 8, y: 8, size: 48, angle: Math.random() * 360 }]
    }
    return Array.from({ length: count }, () => ({
      x: Math.floor(Math.random() * 56),
      y: Math.floor(Math.random() * 56),
      size: Math.floor(Math.random() * 24) + 8,
      angle: Math.random() * 360
    }))
  }, [shape])

  const drawShape = (x: number, y: number, size: number, color: string, emoji: string = '', angle: number = 0) => {
    switch (shape) {
      case 'circle':
        return `<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}" fill="${color}" />`
      case 'square':
        return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}" />`
      case 'emoji':
        return `<text x="${x + size / 2}" y="${y + size / 2}" font-size="${size}" text-anchor="middle" dominant-baseline="central" transform="rotate(${angle}, ${x + size / 2}, ${y + size / 2})">${emoji}</text>`
    }
  }

  const drawFavicon = useCallback(() => {
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">`

    if (clipPath !== 'none') {
      svgContent += `<defs><clipPath id="favicon-clip">`;
      if (clipPath === 'circle') {
        svgContent += `<circle cx="32" cy="32" r="31" />`;
      } else {
        svgContent += `<rect x="1" y="1" width="62" height="62" rx="2" ry="2" />`;
      }
      svgContent += `</clipPath></defs>`;
    }

    svgContent += `<g ${clipPath !== 'none' ? 'clip-path="url(#favicon-clip)"' : ''}>`;

    // Use the background color from colorTheme[2]
    svgContent += `<rect width="64" height="64" fill="${colorTheme[2]}" />`;

    const colors = [colorTheme[0], colorTheme[1]];
    if (itemCount === 1 && shape === 'emoji') {
      // Single emoji in the center
      const pos = positions[0];
      svgContent += drawShape(pos.x, pos.y, pos.size, '', selectedEmoji, pos.angle)
    } else {
      positions.forEach((pos, i) => {
        const color = colors[i % colors.length]
        svgContent += drawShape(pos.x, pos.y, pos.size, color, selectedEmoji, pos.angle)
      })
    }

    svgContent += `</g></svg>`
    setFaviconContent(svgContent)
    return svgContent
  }, [positions, shape, colorTheme, selectedEmoji, itemCount, clipPath])

  const updatePageFavicon = useCallback((svgContent: string) => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);
    
    toast({
      title: "Favicon Updated",
      description: "The page favicon has been updated with your design.",
      duration: 3000,
    })

    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }, []);

  const downloadFavicon = useCallback(() => {
    console.log('Download initiated');
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
    setItemCount(Math.floor(Math.random() * 9) + 1)
    const shapes: Shape[] = ['emoji', 'circle', 'square']
    setShape(shapes[Math.floor(Math.random() * shapes.length)])
    setSelectedEmoji(emojiOptions[Math.floor(Math.random() * emojiOptions.length)])
    const newTheme = {}
    for (let i = 0; i < 3; i++) {
      if (i === 2) {
        newTheme[i] = generateBackgroundColor()
      } else {
        const hue = Math.floor(Math.random() * 360)
        const saturation = Math.floor(Math.random() * 40) + 60 // 60-100%
        const lightness = Math.floor(Math.random() * 30) + 40 // 40-70%
        newTheme[i] = `hsl(${hue}, ${saturation}%, ${lightness}%)`
      }
    }
    setColorTheme(newTheme)
    setClipPath(['none', 'circle', 'square'][Math.floor(Math.random() * 3)] as ClipPath)
    setPositions(generatePositions(itemCount))
  }

  useEffect(() => {
    const newTheme = {}
    for (let i = 0; i < 3; i++) {
      if (i === 2) {
        newTheme[i] = generateBackgroundColor()
      } else {
        const hue = Math.floor(Math.random() * 360)
        const saturation = Math.floor(Math.random() * 40) + 60 // 60-100%
        const lightness = Math.floor(Math.random() * 30) + 40 // 40-70%
        newTheme[i] = `hsl(${hue}, ${saturation}%, ${lightness}%)`
      }
    }
    setColorTheme(newTheme)
  }, [])

  useEffect(() => {
    setPositions(generatePositions(itemCount))
  }, [itemCount, generatePositions, shape])

  useEffect(() => {
    const newSvgContent = drawFavicon()
    updatePageFavicon(newSvgContent)
  }, [drawFavicon, updatePageFavicon])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setColorPickerOpen(false);
      }
      if (emojiSelectorRef.current && !emojiSelectorRef.current.contains(event.target as Node) && 
          !(event.target as Element).closest('button[data-shape="emoji"]')) {
        setEmojiSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setShape('emoji');
    setEmojiSelectorOpen(false);
  };

  const handleCustomEmojiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customEmoji) {
      setSelectedEmoji(customEmoji);
      setShape('emoji');
      setEmojiSelectorOpen(false);
      setCustomEmoji('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-[#5D4037]">Faviconir</h1>
          <a
            href="https://github.com/yourusername/faviconir"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5D4037] hover:text-[#3E2723]"
          >
            <Github className="w-6 h-6" />
          </a>
        </div>
        <p className="text-[#5D4037] mb-8">Generate beautiful favicons with customizable shapes and colors</p>

        <div className="bg-[#E0E0E0] text-[#424242] p-4 rounded-lg mb-8">
          <p>Create unique favicons by adjusting the number of items, shapes, colors, and background styles. Download in SVG or ICO format.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 space-y-6">
            <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-sm">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shape" className="text-sm font-medium text-[#5D4037]">Shape</Label>
                  <div className="flex gap-2 mt-2">
                    <div className="relative">
                      <Button
                        onClick={() => {
                          setShape('emoji');
                          setEmojiSelectorOpen(!emojiSelectorOpen);
                        }}
                        variant={shape === 'emoji' ? 'default' : 'outline'}
                        className="w-10 h-10 p-0"
                      >
                        {selectedEmoji}
                      </Button>
                      {emojiSelectorOpen && shape === 'emoji' && (
                        <div ref={emojiSelectorRef} className="absolute top-full left-0 mt-1 w-48 p-2 bg-white rounded-md shadow-lg z-10">
                          <div className="grid grid-cols-4 gap-2 mb-2">
                            {emojiOptions.map((emoji) => (
                              <div
                                key={emoji}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEmojiSelect(emoji);
                                }}
                                className="h-8 w-8 p-0 flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded"
                              >
                                {emoji}
                              </div>
                            ))}
                          </div>
                          <form onSubmit={handleCustomEmojiSubmit} className="mt-2">
                            <Input
                              type="text"
                              placeholder="Custom emoji"
                              value={customEmoji}
                              onChange={(e) => setCustomEmoji(e.target.value)}
                              className="mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Button type="submit" className="w-full" onClick={(e) => e.stopPropagation()}>
                              Add Custom Emoji
                            </Button>
                          </form>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => setShape('circle')}
                      variant={shape === 'circle' ? 'default' : 'outline'}
                      className="w-10 h-10 p-0 rounded-full"
                    >
                      ⭕
                    </Button>
                    <Button
                      onClick={() => setShape('square')}
                      variant={shape === 'square' ? 'default' : 'outline'}
                      className="w-10 h-10 p-0"
                    >
                      ⬜
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="item-count" className="text-sm font-medium text-[#5D4037]">Amount</Label>
                    <Input
                      id="item-count"
                      type="number"
                      min={1}
                      max={9}
                      value={itemCount}
                      onChange={(e) => setItemCount(Math.max(1, Math.min(9, parseInt(e.target.value) || 1)))}
                      className="w-16 text-center"
                    />
                  </div>
                </div>


                <div>
                  <Label htmlFor="color-theme" className="text-sm font-medium text-[#5D4037] mb-2 block">
                    Color Theme
                  </Label>
                  <div className="flex gap-2">
                    {[0, 1].map((index) => (
                      <button
                        key={index}
                        className="w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#757575] border border-white"
                        style={{ backgroundColor: colorTheme[index] }}
                        onClick={() => {
                          setColorPickerIndex(index);
                          setColorPickerOpen(true);
                        }}
                        aria-label={`Change theme color ${index + 1}`}
                      />
                    ))}
                    <div className="flex-grow"></div>
                    <button
                      className="w-8 h-8 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#757575]"
                      style={{ backgroundColor: colorTheme[2] }}
                      onClick={() => {
                        setColorPickerIndex(2);
                        setColorPickerOpen(true);
                      }}
                      aria-label="Change background color"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="background" className="text-sm font-medium text-[#5D4037] mb-2 block">
                    Clip Path
                  </Label>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => setClipPath('circle')}
                      variant={clipPath === 'circle' ? 'default' : 'outline'}
                      size="icon"
                      className="w-8 h-8 rounded-full"
                    >
                      <Circle className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setClipPath('square')}
                      variant={clipPath === 'square' ? 'default' : 'outline'}
                      size="icon"
                      className="w-8 h-8"
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setClipPath('none')}
                      variant={clipPath === 'none' ? 'default' : 'outline'}
                      size="icon"
                      className="w-8 h-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={() => setPositions(generatePositions(itemCount))} className="flex-1 bg-[#9E9E9E] text-[#424242] hover:bg-[#757575]">
                    Reposition
                  </Button>
                  <Button onClick={randomizeAll} className="flex-1 bg-[#9E9E9E] text-[#424242] hover:bg-[#757575]">
                    Randomize All
                  </Button>
                </div>
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
                    className="w-10 h-10 p-0 bg-[#757575] text-white hover:bg-[#616161] disabled:bg-gray-400"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/3 flex flex-col items-center justify-center">
            <div 
              className="w-72 h-72 bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg mb-4 flex items-center justify-center overflow-hidden cursor-pointer p-8"
              style={{ boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)' }}
              aria-label="Favicon preview"
              onClick={downloadFavicon}
            >
              <div 
                dangerouslySetInnerHTML={{ __html: faviconContent.replace('width="64" height="64"', 'width="224" height="224"') }}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
      {colorPickerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={colorPickerRef} className="bg-white p-4 rounded-lg">
            <HexColorPicker 
              color={colorTheme[colorPickerIndex]} 
              onChange={(color) => {
                setColorTheme(prev => ({ ...prev, [colorPickerIndex]: color }));
              }} 
            />
            <Button onClick={() => setColorPickerOpen(false)} className="mt-4 w-full">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

