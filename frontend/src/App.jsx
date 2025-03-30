import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [dynamicText, setDynamicText] = useState('')
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [showCursor, setShowCursor] = useState(true)

  const texts = ['...a different side', '...another angle', 'the FlipSide']

  useEffect(() => {
    // Blinking cursor effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [])

  useEffect(() => {
    let timeoutId
    let currentIndex = 0
    let currentText = ''
    let isDeleting = false

    const typeText = () => {
      const fullText = texts[currentIndex]
      
      if (isDeleting) {
        currentText = fullText.substring(0, currentText.length - 1)
        setDynamicText(currentText)
        if (currentText === '') {
          isDeleting = false
          currentIndex = (currentIndex + 1) % texts.length
        }
      } else {
        currentText = fullText.substring(0, currentText.length + 1)
        setDynamicText(currentText)
        if (currentText === fullText) {
          // If we've reached "the FlipSide", stop the animation
          if (currentText === 'the FlipSide') {
            return
          }
          // Add 2 second pause before deleting
          timeoutId = setTimeout(() => {
            isDeleting = true
            typeText()
          }, 2000)
          return
        }
      }

      const typingSpeed = isDeleting ? 50 : 100
      timeoutId = setTimeout(typeText, typingSpeed)
    }

    typeText()

    return () => clearTimeout(timeoutId)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to analyze article')
      }
      
      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">
          Show me {dynamicText}
          <span className={`inline-block w-[4px] h-[1.2em] bg-gray-800 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`} style={{ verticalAlign: 'middle', marginTop: '-4px', borderRadius: '2px' }}></span>
        </h1>
        
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a news article URL..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'See the Other Side'}
            </button>
          </div>
        </form>

        {error && (
          <div className="max-w-2xl mx-auto p-4 bg-red-100 text-red-700 rounded-lg mb-8">
            {error}
          </div>
        )}

        {results && (
          <div className="grid grid-cols-3 gap-6">
            {/* Original Article */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Original Article</h2>
              <h3 className="text-lg font-medium mb-2">{results.original_article.title}</h3>
              <p className="text-sm text-gray-600 mb-4">Source: {results.original_article.source}</p>
              <div className="prose max-w-none">
                {results.original_article.content}
              </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">AI Analysis</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Summary</h3>
                  <p>{results.ai_analysis.summary}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Pros</h3>
                  <ul className="list-disc pl-5">
                    {results.ai_analysis.pros.map((pro, index) => (
                      <li key={index}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Cons</h3>
                  <ul className="list-disc pl-5">
                    {results.ai_analysis.cons.map((con, index) => (
                      <li key={index}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Counter Article */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Counter Article</h2>
              <h3 className="text-lg font-medium mb-2">{results.counter_article.title}</h3>
              <p className="text-sm text-gray-600 mb-4">Source: {results.counter_article.source}</p>
              <div className="prose max-w-none">
                {results.counter_article.content}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
