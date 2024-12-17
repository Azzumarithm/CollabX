import React from 'react'

function Hero() {
  return (
    <div className="relative" id="home">
      <div aria-hidden="true" className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20">
        <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-red-400 dark:from-blue-700"></div>
        <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-300 dark:to-indigo-600"></div>
      </div>
      <div>
        <div className="relative pt-36 ml-auto">
          <div className="lg:w-2/3 text-center mx-auto">
            <h1 className="text-gray-900 dark:text-white font-bold text-5xl md:text-6xl xl:text-7xl">
              <span style={{ color: 'red' }}>RedFlag</span> is an
              <span className="dark:text-white"> innovative backend solution</span>
            </h1>
            <p className="mt-8 text-gray-700 dark:text-gray-300">designed to enhance user authentication systems by leveraging Google Cloud’s Vertex AI Gemini model for real-time anomaly detection.CollabX integrates advanced AI capabilities with robust data processing pipelines to ensure secure, seamless, and adaptive user authentication.</p>
            <div className="mt-16 flex flex-wrap justify-center gap-y-4 gap-x-6">
              <a
                href="/dashboard"
                className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-red-600 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
              >
                <span className="relative text-base font-semibold text-white"
                >Get started</span
                >
              </a>
              <a
                href="#"
                className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-primary/10 before:bg-gradient-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 dark:before:border-gray-700 dark:before:bg-gray-800 sm:w-max"
              >
                <span
                  className="relative text-base font-semibold text-red-500 dark:text-white"
                >Learn more</span>
              </a>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

export default Hero