import React from 'react'

export default function Footer() {
  return (
    <footer className="text-center p-6 bg-gray-800 text-white">
    <p className="text-sm">
      © {new Date().getFullYear()}{" "}
      <span className="font-semibold">Anonymous Message</span> | Speak your
      mind, stay anonymous.
    </p>
  </footer>
  )
}
