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
  const resultsRef = useRef(null)
  const promptRef = useRef(null)

 
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])


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
      const response = await fetch('https://flipside-backend.onrender.com/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to analyze article')
      }

      setResults(data)

      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="prompt-spacer" aria-hidden="true"></div>
        <div ref={promptRef} className="prompt-wrapper">
          <h1 className="text-4xl font-bold text-center mb-4" style={{ color: '#1F1A38' }}>
            Show me {dynamicText.includes('FlipSide') ? (
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
            <div className="box4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a news article URL..."
                className="input-field"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? 'Analyzing...' : 'See the Other Side'}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto p-4 bg-red-100 text-red-700 rounded-lg mb-8">
            {error}
          </div>
        )}

        {results && (
          <div ref={resultsRef}>
            {/* Original Article Title */}
            <h2 className="section-title">Original Article</h2>
            
            {/* Original Article Content */}
            <div className="original-article">
              <h3>{results.original_article.title}</h3>
              <p>Source: {results.original_article.source}</p>
              <h3 style={{ marginTop: '0.5rem' }}>{results.original_article.bias?.charAt(0).toUpperCase() + results.original_article.bias?.slice(1).toLowerCase()}-Leaning</h3>
              <div>{results.original_article.content}</div>
            </div>

            {/* AI Analysis Header */}
            <h2 className="section-title">AI Analysis</h2>

            {/* Two Column Layout */}
            <div className="analysis-section">
              {/* Left Column - AI Analysis */}
              <div className="analysis-column">
                <h3>Summary</h3>
                <p>{results.ai_analysis.summary}</p>

                <h3>Points for Supporting</h3>
                <ul>
                  {results.ai_analysis.pros.map((pro, index) => (
                    <li key={index}>{pro}</li>
                  ))}
                </ul>

                <h3>Points for Rejecting</h3>
                <ul>
                  {results.ai_analysis.cons.map((con, index) => (
                    <li key={index}>{con}</li>
                  ))}
                </ul>
              </div>

              {/* Right Column - Counter Article */}
              {results.counter_article && results.counter_article.ai_analysis ? (
              <div className="analysis-column">
                <h3 style={{ color: '#51BBFE' }}>Article from Other Perspective</h3>
                <h4>{results.counter_article.title}</h4>
                <p>Source: {results.counter_article.source}</p>
                {results.counter_article.url && (
                    <a
                      href={results.counter_article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline inline-block mb-2"
                    >
                      Read full article ↗
                    </a>
                  )}
                <div>{results.counter_article.content}</div>

                <h3>Summary</h3>
                <p>{results.counter_article.ai_analysis.summary}</p>

                <h3>Counterpoints</h3>
                <ul>
                  {results.counter_article.ai_analysis.pros.map((pro, index) => (
                    <li key={index}>{pro}</li>
                  ))}
                </ul>

                <h3>Shortcomings</h3>
                <ul>
                  {results.counter_article.ai_analysis.cons.map((con, index) => (
                    <li key={index}>{con}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="analysis-column">
                <p>No counterpoint article found for this topic.</p>
              </div>
            )}

            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                onClick={() => {
                  promptRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
                }}
                className="submit-button"
              >
                Back to Prompt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App