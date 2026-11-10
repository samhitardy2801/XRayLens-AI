
import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  ScanLine,
  Brain,
  ShieldCheck,
  ImagePlus,
  X,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
} from 'lucide-react'

export default function App() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Handle image upload
  const handleUpload = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!['image/jpeg', 'image/png'].includes(selected.type)) {
      setError('Please upload a JPG or PNG image.')
      e.target.value = ''
      return
    }

    if (preview) URL.revokeObjectURL(preview)

    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setResult(null)
    setError('')
  }

  // Remove selected image
  const removeImage = () => {
    if (preview) URL.revokeObjectURL(preview)

    setFile(null)
    setPreview(null)
    setResult(null)
    setError('')
  }

  // Send image to FastAPI backend
  const handleAnalyze = async () => {
    if (!file || loading) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Prediction failed.')
      }

      if (!data.result || !data.explainability?.overlay_image) {
        throw new Error('The backend returned an incomplete response.')
      }

      setResult(data)

    } catch (err) {
      setError(
        err.message || 'Unable to connect to the backend. Check whether FastAPI is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  const prediction = result?.result?.prediction
  const confidence = result?.result?.confidence
  const probabilities = result?.result?.probabilities

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#172B4D]">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-3 text-white">
              <Activity size={23} />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight">
                XRayLens <span className="text-blue-600">AI</span>
              </h2>
              <p className="mt-1 text-[10px] font-semibold tracking-[2px] text-slate-400">
                INTELLIGENT IMAGING
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700">
              Research Prototype
            </span>
          </div>

        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-12 lg:pt-24">

        {/* Hero */}
        <section className="mb-20 text-center">

          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-3 text-xs font-semibold text-blue-700 shadow-sm">
            <ScanLine size={16} />
            EXPLAINABLE CHEST X-RAY ANALYSIS
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-[#142B4D] sm:text-5xl lg:text-6xl">
            A clearer view of
            <span className="mt-2 block text-blue-600">
              AI-powered imaging.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">
            Explore pneumonia classification with deep learning
            and understand model predictions through visual explanations.
          </p>

        </section>

        {/* Upload Workspace */}
        <section className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(36,65,110,0.09)] lg:grid-cols-[1.35fr_0.85fr]">

          {/* Upload Panel */}
          <div className="p-8 sm:p-10 lg:p-12">

            <div className="mb-9">
              <p className="text-xs font-bold uppercase tracking-[2px] text-blue-600">
                START ANALYSIS
              </p>

              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Upload your X-ray
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                Select a chest X-ray image from your device to get started.
              </p>
            </div>

            {/* Upload Area */}
            <label className="flex min-h-[340px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-[#F7FAFF] p-7 text-center transition hover:border-blue-400 hover:bg-blue-50">

              {preview ? (
                <img
                  src={preview}
                  alt="Selected chest X-ray"
                  className="max-h-[280px] max-w-full rounded-xl object-contain"
                />
              ) : (
                <>
                  <div className="mb-7 rounded-2xl bg-white p-6 text-blue-600 shadow-md shadow-blue-100">
                    <ImagePlus size={36} />
                  </div>

                  <h3 className="text-lg font-bold">
                    Drop your image here
                  </h3>

                  <p className="mt-4 text-sm text-slate-400">
                    or browse files from your device
                  </p>

                  <span className="mt-8 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200">
                    Choose X-ray
                  </span>
                </>
              )}

              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleUpload}
                className="hidden"
              />
            </label>

            {/* Selected File */}
            {file && (
              <div className="mt-5 flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">

                <ImagePlus size={22} className="shrink-0 text-blue-600" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {file.name}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <button
                  onClick={removeImage}
                  aria-label="Remove image"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-red-500"
                >
                  <X size={19} />
                </button>

              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  Analyzing X-ray...
                </>
              ) : (
                <>
                  Analyze X-ray
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="mt-5 text-center text-xs text-slate-400">
              Supported formats: JPG and PNG
            </p>

            {/* Error Message */}
            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

          </div>

          {/* Information Panel */}
          <aside className="relative flex flex-col justify-between overflow-hidden bg-[#142B4D] p-9 text-white sm:p-12">

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-blue-300/10" />
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-blue-300/10" />

            <div className="relative">

              <p className="text-xs font-bold tracking-[2px] text-blue-300">
                POWERED BY DEEP LEARNING
              </p>

              <h3 className="mt-7 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Intelligence
                <br />
                meets clarity.
              </h3>

              <p className="mt-7 text-sm leading-8 text-blue-100/65">
                Explore AI predictions and understand which image regions
                influence the model's output.
              </p>

            </div>

            {/* Illustration */}
            <div className="relative my-16 flex justify-center">
              <div className="flex h-48 w-48 items-center justify-center rounded-full border border-blue-300/20 bg-blue-400/10">
                <div className="flex h-36 w-36 items-center justify-center rounded-full border border-blue-300/30 bg-blue-400/10">
                  <Activity
                    size={70}
                    strokeWidth={1.2}
                    className="text-blue-200"
                  />
                </div>
              </div>
            </div>

            {/* Technologies */}
            <div className="relative space-y-7">

              <div className="flex items-center gap-4 border-t border-white/10 pt-7">
                <div className="rounded-xl bg-white/10 p-3.5 text-blue-200">
                  <Brain size={23} />
                </div>

                <div>
                  <p className="text-sm font-bold">ResNet18</p>
                  <p className="mt-2 text-xs text-blue-100/55">
                    Deep learning classification
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t border-white/10 pt-7">
                <div className="rounded-xl bg-white/10 p-3.5 text-blue-200">
                  <ScanLine size={23} />
                </div>

                <div>
                  <p className="text-sm font-bold">Grad-CAM</p>
                  <p className="mt-2 text-xs text-blue-100/55">
                    Visual AI explainability
                  </p>
                </div>
              </div>

            </div>

          </aside>

        </section>

        {/* Prediction Results */}
        {result && (
          <section className="mx-auto mt-16 max-w-5xl">

            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[2px] text-blue-600">
                ANALYSIS COMPLETE
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#172B4D]">
                Prediction Results
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                Results generated by the ResNet18 classification model.
              </p>
            </div>

            {/* Prediction Summary */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-sm font-semibold text-slate-400">
                    MODEL PREDICTION
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <CheckCircle2
                      size={27}
                      className="text-blue-600"
                    />

                    <h3 className="text-3xl font-extrabold text-[#172B4D]">
                      {prediction}
                    </h3>
                  </div>
                </div>

                <div className="rounded-2xl bg-blue-50 px-7 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                    Model confidence
                  </p>

                  <p className="mt-2 text-4xl font-extrabold text-blue-700">
                    {Number(confidence).toFixed(2)}%
                  </p>
                </div>

              </div>

              {/* Probability Bars */}
              <div className="mt-10 border-t border-slate-100 pt-8">

                <h3 className="mb-7 text-lg font-bold">
                  Class Probabilities
                </h3>

                {['NORMAL', 'PNEUMONIA'].map((className) => {
                  const value = Number(probabilities?.[className] ?? 0)

                  return (
                    <div key={className} className="mb-7 last:mb-0">

                      <div className="mb-3 flex justify-between">
                        <span className="text-sm font-semibold text-slate-600">
                          {className}
                        </span>

                        <span className="text-sm font-bold text-[#172B4D]">
                          {value.toFixed(2)}%
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            className === 'PNEUMONIA'
                              ? 'bg-blue-600'
                              : 'bg-emerald-500'
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(0, value))}%`,
                          }}
                        />
                      </div>

                    </div>
                  )
                })}

              </div>

            </div>

            {/* Explainability Results */}
            <div className="mt-12">

              <div className="mb-7">
                <p className="text-xs font-bold uppercase tracking-[2px] text-blue-600">
                  MODEL EXPLAINABILITY
                </p>

                <h3 className="mt-3 text-2xl font-bold text-[#172B4D]">
                  Understanding the prediction
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  Grad-CAM highlights image regions that contributed
                  to the model's prediction.
                </p>
              </div>

              <div className="grid gap-7 md:grid-cols-2">

                {/* Original X-ray */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <h4 className="mb-5 text-sm font-bold text-[#172B4D]">
                    Original X-ray
                  </h4>

                  <div className="flex min-h-[250px] items-center justify-center rounded-xl bg-slate-100 p-3">
                    <img
                      src={preview}
                      alt="Original uploaded chest X-ray"
                      className="max-h-[350px] w-full object-contain"
                    />
                  </div>

                </div>

                {/* Grad-CAM */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <h4 className="mb-5 text-sm font-bold text-[#172B4D]">
                    Grad-CAM Heatmap Overlay
                  </h4>

                  <div className="flex min-h-[250px] items-center justify-center rounded-xl bg-slate-100 p-3">
                    <img
                      src={result.explainability.overlay_image}
                      alt="Grad-CAM heatmap overlay"
                      className="max-h-[350px] w-full object-contain"
                    />
                  </div>

                </div>

              </div>

              <p className="mt-5 text-xs leading-6 text-slate-400">
                Grad-CAM provides a visual explanation of model activation.
                Highlighted regions should not be interpreted as proof of
                disease or clinical evidence.
              </p>

            </div>

          </section>
        )}

        {/* Disclaimer */}
        <footer className="mx-auto mt-16 flex max-w-5xl items-start justify-center gap-3 border-t border-slate-200 pt-8 text-center">

          <ShieldCheck size={18} className="mt-1 shrink-0 text-slate-400" />

          <p className="max-w-2xl text-xs leading-6 text-slate-400">
            XRayLens AI is an educational research prototype and is not
            a clinically validated diagnostic tool. It must not replace
            professional medical advice.
          </p>

        </footer>

      </main>
    </div>
  )
}
