import { useState, useEffect, useRef } from 'react' 
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [dynamicText, setDynamicText] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  const texts = ['... a different side', '... another angle', 'the FlipSide']
  const isDeleting = useRef(false)
  const textIndex = useRef(0)
  const charIndex = useRef(0)
  const timeoutRef = useRef(null)

  // blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // typing effect
  useEffect(() => {
    const type = () => {
      const fullText = texts[textIndex.current]
      const currentCharIndex = charIndex.current

      let updatedText = ''

      if (isDeleting.current) {
        updatedText = fullText.slice(0, currentCharIndex - 1)
        charIndex.current -= 1
      } else {
        updatedText = fullText.slice(0, currentCharIndex + 1)
        charIndex.current += 1
      }

      setDynamicText(updatedText)

      if (!isDeleting.current && updatedText === fullText) {
        if (fullText === 'the FlipSide') return // stop on last phrase
        isDeleting.current = true
        timeoutRef.current = setTimeout(type, 1500)
      } else if (isDeleting.current && updatedText === '') {
        isDeleting.current = false
        textIndex.current = (textIndex.current + 1) % texts.length
        timeoutRef.current = setTimeout(type, 500)
      } else {
        timeoutRef.current = setTimeout(type, isDeleting.current ? 50 : 100)
      }
    }

    type()

    return () => clearTimeout(timeoutRef.current)
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

      if (!response.ok) throw new Error('Failed to analyze article')

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
        <h1 className="text-4xl font-bold text-center mb-4" style={{ color: '#1F1A38' }}>
          Show me{' '}
          {dynamicText.includes('FlipSide') ? (
            <>
              {dynamicText.split('FlipSide')[0]}
              <span style={{ color: '#51BBFE' }}>FlipSide</span>
            </>
          ) : (
            dynamicText
          )}
          <span
            className={`inline-block w-[4px] h-[1.2em] bg-[#1F1A38] ml-1 ${
              showCursor ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              verticalAlign: 'middle',
              marginTop: '-4px',
              borderRadius: '2px',
            }}
          ></span>
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
              <h3 className="text-lg font-medium mb-2">
                {results.original_article.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Source: {results.original_article.source}
              </p>
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
              <h3 className="text-lg font-medium mb-2">
                {results.counter_article.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Source: {results.counter_article.source}
              </p>
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