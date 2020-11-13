import React from 'react'

type LoaderProps = {
  text?: string
}

const Loader = ({ text }: LoaderProps) => {
  return (
    <div className="flex flex-col">
      {text && (
        <div className="my-4">
          <h3>{text}</h3>
        </div>
      )}

      <section className="loader-container">
        <div className="loader-div">
          <div className="loader-div">
            <span className="one h6"></span>
            <span className="two h3"></span>
          </div>
        </div>

        <div className="loader-div">
          <div className="loader-div">
            <span className="one h1"></span>
            <span className="two h4"></span>
          </div>
        </div>

        <div className="loader-div">
          <div className="loader-div">
            <span className="one h5"></span>
            <span className="two h2"></span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Loader
