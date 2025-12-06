"use client"

import React, { useCallback, useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Github, Circle, Square, X, Download, Zap } from 'lucide-react'
import { HexColorPicker } from "react-colorful"
import { toast } from "@/hooks/use-toast"

type Shape = 'emoji' | 'circle' | 'shader'
type DownloadFormat = 'svg' | 'ico'
type ClipPath = 'none' | 'circle' | 'square'

const emojiOptions = ['😊', '🚀', '🌈', '🎉', '🔥', '💡', '🌟', '🍕']

export default function Faviconir() {
  const [itemCount, setItemCount] = useState(3)
  const [shape, setShape] = useState<Shape>('shader')
  const [colorTheme, setColorTheme] = useState<{ [key: number]: string }>({
    0: '#000000',
    1: '#666666',
    2: '#ffffff' // Background
  })
  const [faviconContent, setFaviconContent] = useState<string>('')
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>('svg')
  const [positions, setPositions] = useState<Array<{x: number, y: number, size: number, angle: number}>>([])
  const [selectedEmoji, setSelectedEmoji] = useState<string>('😊');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [clipPath, setClipPath] = useState<ClipPath>('circle');
  const [colorPickerIndex, setColorPickerIndex] = useState(0);
  const [emojiSelectorOpen, setEmojiSelectorOpen] = useState(false);
  const [emojiFilter, setEmojiFilter] = useState(true);
  const [customEmoji, setCustomEmoji] = useState('');
  const [shaderLayers, setShaderLayers] = useState<Array<{x: number, y: number, size: number, color: string}>>([]);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const emojiSelectorRef = useRef<HTMLDivElement>(null);

  const generateRandomPosition = (size: number, max: number) => {
    return Math.floor(Math.random() * (max - size))
  }

  const generateShaderLayers = useCallback(() => {
    const count = 6;
    const layers = [];
    // Base hue to ensure some harmony, but wide variance for interest
    const baseHue = Math.floor(Math.random() * 360);
    
    for (let i = 0; i < count; i++) {
      // Distribute hues across the spectrum relative to base, ensuring variety
      // Mix of analogous (nearby) and complementary (opposite) colors
      const hueOffset = (i * 60) + Math.floor(Math.random() * 60) - 30; 
      const hue = (baseHue + hueOffset + 360) % 360;
      
      const saturation = 65 + Math.floor(Math.random() * 35); // 65-100% - keep it vibrant
      const lightness = 45 + Math.floor(Math.random() * 35); // 45-80% - avoid too dark/light
      const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      
      layers.push({
        x: Math.floor(Math.random() * 80) - 10,
        y: Math.floor(Math.random() * 80) - 10,
        size: 40 + Math.floor(Math.random() * 40),
        color
      });
    }
    return layers;
  }, []);

  const generateBackgroundColor = () => {
    const hue = Math.floor(Math.random() * 360)
    return `hsl(${hue}, 0%, 95%)` // Tech minimal: very light gray
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
      case 'emoji':
        // Encode the emoji for use in SVG
        const encodedEmoji = emoji.codePointAt(0)?.toString(16) || '';
        const filterAttr = emojiFilter ? 'filter="url(#grayscale)"' : '';
        return `<text x="${x + size / 2}" y="${y + size / 2}" font-size="${size}" text-anchor="middle" dominant-baseline="central" transform="rotate(${angle}, ${x + size / 2}, ${y + size / 2})" ${filterAttr}>&#x${encodedEmoji};</text>`
      case 'shader':
          return '';
    }
  }

  const drawFavicon = useCallback(() => {
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">`

    // Add definitions
    svgContent += `<defs>`
    
    // Clip path definition
    if (clipPath !== 'none') {
      svgContent += `<clipPath id="favicon-clip">`;
      if (clipPath === 'circle') {
        svgContent += `<circle cx="32" cy="32" r="31" />`;
      } else {
        svgContent += `<rect x="1" y="1" width="62" height="62" rx="0" ry="0" />`; // sharp corners
      }
      svgContent += `</clipPath>`;
    }

    // Grayscale filter definition
    if (emojiFilter) {
      svgContent += `<filter id="grayscale"><feColorMatrix type="matrix" values="0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"/></filter>`
    }
    
    // Blur filter for shader
    if (shape === 'shader') {
         svgContent += `<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="10" /></filter>`
    }

    svgContent += `</defs>`

    svgContent += `<g ${clipPath !== 'none' ? 'clip-path="url(#favicon-clip)"' : ''}>`;

    // Background
    if (shape === 'shader') {
        // For shader, use a solid base
         svgContent += `<rect width="64" height="64" fill="#ffffff" />`;
         shaderLayers.forEach(layer => {
             svgContent += `<circle cx="${layer.x}" cy="${layer.y}" r="${layer.size}" fill="${layer.color}" filter="url(#blur)" opacity="0.8" />`
         });
    } else {
        // Use the background color from colorTheme[2]
        svgContent += `<rect width="64" height="64" fill="${colorTheme[2]}" />`;

        const colors = [colorTheme[0], colorTheme[1]];
        if (itemCount === 1 && shape === 'emoji') {
        // Single emoji in the center
        const pos = positions[0];
        if (pos) {
            svgContent += drawShape(pos.x, pos.y, pos.size, '', selectedEmoji, pos.angle)
        }
        } else {
        positions.forEach((pos, i) => {
            const color = colors[i % colors.length]
            svgContent += drawShape(pos.x, pos.y, pos.size, color, selectedEmoji, pos.angle)
        })
        }
    }

    svgContent += `</g></svg>`
    setFaviconContent(svgContent)
    return svgContent
  }, [positions, shape, colorTheme, selectedEmoji, itemCount, clipPath, emojiFilter, shaderLayers])

  const updatePageFavicon = useCallback((svgContent: string) => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);
    
    // Toast notification is a bit distracting for minimal UI, maybe just update silently or small indicator?
    // keeping it but minimalist style would be better.
    
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }, []);

  const downloadFavicon = useCallback(() => {
    if (!faviconContent) return;

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
        ctx?.drawImage(img, 0, 0, 16, 16)
        canvas.toBlob((blob) => {
          if (blob) {
            blob.arrayBuffer().then((buffer) => {
              const icoData = new Uint8Array(buffer.byteLength + 22);
              const icoView = new DataView(icoData.buffer);

              // ICO header
              icoView.setUint16(0, 0, true); // Reserved. Must always be 0.
              icoView.setUint16(2, 1, true); // Specifies image type: 1 for icon (.ICO) image
              icoView.setUint16(4, 1, true); // Specifies number of images in the file.

              // Image entry
              icoView.setUint8(6, 16); // Width of the image
              icoView.setUint8(7, 16); // Height of the image
              icoView.setUint8(8, 0);  // Number of colors in the color palette
              icoView.setUint8(9, 0);  // Reserved. Should be 0.
              icoView.setUint16(10, 1, true); // Color planes
              icoView.setUint16(12, 32, true); // Bits per pixel
              icoView.setUint32(14, buffer.byteLength, true); // Size of the image data
              icoView.setUint32(18, 22, true); // Offset of the image data from the beginning of the file

              // Copy the PNG data
              icoData.set(new Uint8Array(buffer), 22);

              const icoBlob = new Blob([icoData], { type: 'image/x-icon' });
              const url = URL.createObjectURL(icoBlob)
              const link = document.createElement('a')
              link.href = url
              link.download = 'favicon.ico'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              URL.revokeObjectURL(url)
            }).catch(error => {
              console.error('Error creating ICO file:', error);
              toast({
                title: "Error",
                description: "Failed to create ICO file.",
                duration: 3000,
              });
            });
          }
        }, 'image/png')
      }
      img.src = 'data:image/svg+xml;base64,' + btoa(faviconContent)
    }
  }, [faviconContent, downloadFormat])

  const randomizeAll = () => {
    const shapes: Shape[] = ['emoji', 'circle', 'shader']
    const newShape = shapes[Math.floor(Math.random() * shapes.length)];
    setShape(newShape)
    
    if (newShape === 'shader') {
        setShaderLayers(generateShaderLayers());
        setItemCount(1); // Not used for shader, but good to reset
    } else {
        setItemCount(Math.floor(Math.random() * 9) + 1)
        setPositions(generatePositions(itemCount))
    }

    setSelectedEmoji(emojiOptions[Math.floor(Math.random() * emojiOptions.length)])
    const newTheme: any = {}
    for (let i = 0; i < 3; i++) {
      if (i === 2) {
        newTheme[i] = '#ffffff' // Always white bg for minimal
      } else {
        const gray = Math.floor(Math.random() * 200)
        newTheme[i] = `rgb(${gray}, ${gray}, ${gray})`
      }
    }
    setColorTheme(newTheme)
    setClipPath(['none', 'circle', 'square'][Math.floor(Math.random() * 3)] as ClipPath)
  }

  useEffect(() => {
    // Initial random state but controlled
    setPositions(generatePositions(itemCount))
    setShaderLayers(generateShaderLayers())
  }, [itemCount, generatePositions, shape, generateShaderLayers])

  useEffect(() => {
    const newSvgContent = drawFavicon()
    setFaviconContent(newSvgContent)
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
    <div className="min-h-screen bg-white text-black font-sans">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="flex items-center justify-between mb-12 border-b border-black pb-4">
          <h1 className="text-3xl font-mono font-bold tracking-tighter uppercase">Faviconir_</h1>
          <a
            href="https://github.com/huozhi/faviconir"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:bg-black hover:text-white px-2 py-1 transition-colors font-mono text-sm"
          >
            GH_SOURCE
          </a>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Controls Section */}
          <div className="md:col-span-4 space-y-8">
            <div className="space-y-6 border border-black p-6 bg-white">
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-wider text-gray-500">Shape</Label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                        setShape('shader');
                        setShaderLayers(generateShaderLayers());
                    }}
                    variant="outline"
                    className={`h-10 w-10 p-0 border-black rounded-none ${shape === 'shader' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                    title="Shader Abstract"
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      setShape('emoji');
                      setEmojiSelectorOpen(!emojiSelectorOpen);
                    }}
                    variant="outline"
                    className={`h-10 w-10 p-0 border-black rounded-none ${shape === 'emoji' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                    data-shape="emoji"
                  >
                    {selectedEmoji}
                  </Button>
                  {emojiSelectorOpen && (
                    <div ref={emojiSelectorRef} className="absolute mt-12 ml-12 w-48 p-2 bg-white border border-black z-10">
                       <div className="grid grid-cols-4 gap-2 mb-2">
                          {emojiOptions.map((emoji) => (
                            <div
                              key={emoji}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEmojiSelect(emoji);
                              }}
                              className="h-8 w-8 p-0 flex items-center justify-center cursor-pointer hover:bg-gray-100"
                            >
                              {emoji}
                            </div>
                          ))}
                        </div>
                        <form onSubmit={handleCustomEmojiSubmit}>
                           <Input
                              type="text"
                              placeholder="Custom"
                              value={customEmoji}
                              onChange={(e) => setCustomEmoji(e.target.value)}
                              className="mb-2 h-8 text-sm border-black rounded-none"
                            />
                            <Button type="submit" className="w-full h-8 text-xs bg-black text-white rounded-none hover:bg-gray-800">ADD</Button>
                        </form>
                    </div>
                  )}
                  <Button
                    onClick={() => setShape('circle')}
                    variant="outline"
                    className={`h-10 w-10 p-0 border-black rounded-none ${shape === 'circle' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                  >
                    <Circle className="h-4 w-4" />
                  </Button>
                  {shape === 'emoji' && (
                    <Button
                        onClick={() => setEmojiFilter(!emojiFilter)}
                        variant="outline"
                        className={`h-10 px-2 border-black rounded-none font-mono text-[10px] uppercase ${emojiFilter ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                        title="Toggle Grayscale"
                    >
                        Mono
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-mono text-xs uppercase tracking-wider text-gray-500">Count</Label>
                  <span className="font-mono text-sm">{itemCount}</span>
                </div>
                <Input
                    type="range"
                    min={1}
                    max={9}
                    value={itemCount}
                    onChange={(e) => setItemCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-none appearance-none cursor-pointer accent-black border-none p-0"
                />
              </div>

              <div className={`space-y-2 ${shape === 'shader' ? 'opacity-30 pointer-events-none' : ''}`}>
                <Label className="font-mono text-xs uppercase tracking-wider text-gray-500">Colors</Label>
                <div className="flex gap-2">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="flex flex-col items-center gap-1">
                        <button
                            className="w-8 h-8 border border-black focus:outline-none"
                            style={{ backgroundColor: colorTheme[index] }}
                            onClick={() => {
                            setColorPickerIndex(index);
                            setColorPickerOpen(true);
                            }}
                        />
                        <span className="text-[10px] font-mono text-gray-400">{index === 2 ? 'BG' : `C${index+1}`}</span>
                    </div>
                  ))}
                </div>
              </div>

               <div className="space-y-2">
                  <Label className="font-mono text-xs uppercase tracking-wider text-gray-500">Clip</Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setClipPath('none')}
                      variant="outline"
                      className={`h-8 w-8 p-0 border-black rounded-none ${clipPath === 'none' ? 'bg-black text-white' : ''}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setClipPath('circle')}
                      variant="outline"
                      className={`h-8 w-8 p-0 border-black rounded-none ${clipPath === 'circle' ? 'bg-black text-white' : ''}`}
                    >
                      <Circle className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => setClipPath('square')}
                      variant="outline"
                      className={`h-8 w-8 p-0 border-black rounded-none ${clipPath === 'square' ? 'bg-black text-white' : ''}`}
                    >
                       <Square className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
            </div>

             <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => {
                        if (shape === 'shader') {
                            setShaderLayers(generateShaderLayers());
                        } else {
                            setPositions(generatePositions(itemCount))
                        }
                    }} 
                    variant="outline" 
                    className="border-black text-black rounded-none hover:bg-black hover:text-white font-mono text-xs h-10 uppercase"
                  >
                    {shape === 'shader' ? 'Regenerate' : 'Reposition'}
                  </Button>
                  <Button onClick={randomizeAll} variant="outline" className="border-black text-black rounded-none hover:bg-black hover:text-white font-mono text-xs h-10 uppercase">
                    Randomize
                  </Button>
             </div>
          </div>

          {/* Preview Section */}
          <div className="md:col-span-8 flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 relative h-[600px]">
            <div className="absolute top-4 left-4 font-mono text-xs text-gray-400 uppercase tracking-widest">Preview Area</div>
            
            <div 
              className="w-64 h-64 bg-white border border-black shadow-none flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
              onClick={downloadFavicon}
            >
              <div 
                dangerouslySetInnerHTML={{ __html: faviconContent.replace('width="64" height="64"', 'width="200" height="200"') }}
                className="w-full h-full p-4 flex items-center justify-center"
              />
            </div>

            <div className="mt-8 flex gap-4 items-center w-full max-w-xs">
                <div className="flex border border-black">
                   <button
                      onClick={() => setDownloadFormat('svg')}
                      className={`px-3 py-2 font-mono text-xs uppercase transition-colors ${downloadFormat === 'svg' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                   >
                      SVG
                   </button>
                   <button
                      onClick={() => setDownloadFormat('ico')}
                      className={`px-3 py-2 font-mono text-xs uppercase transition-colors border-l border-black ${downloadFormat === 'ico' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                   >
                      ICO
                   </button>
                </div>
                  <Button 
                    onClick={downloadFavicon} 
                    className="flex-1 h-9 bg-black text-white rounded-none hover:bg-gray-800 font-mono text-xs uppercase tracking-wider"
                  >
                    Download
                  </Button>
            </div>
          </div>
        </div>
      </div>

      {colorPickerOpen && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setColorPickerOpen(false)}>
          <div 
            ref={colorPickerRef} 
            className="bg-white p-4 border border-black shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <HexColorPicker 
              color={colorTheme[colorPickerIndex]} 
              onChange={(color) => {
                setColorTheme(prev => ({ ...prev, [colorPickerIndex]: color }));
              }} 
            />
             <div className="mt-4 flex justify-between items-center">
                <span className="font-mono text-xs uppercase">{colorTheme[colorPickerIndex]}</span>
                <Button onClick={() => setColorPickerOpen(false)} size="sm" className="bg-black text-white rounded-none h-8 text-xs">
                  DONE
                </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
