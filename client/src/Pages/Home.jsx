import React from 'react'
import Search from '../components/Search'
import Hero from '../components/Hero'
import Team from '../components/Team'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <>
      <div id ="home">
        <Search />
      </div>
      <div id ="hero">
        <Hero />
      </div>    
      <div id ="about">
        <Team />
      </div>    
      {/* <div>
        <Footer />
      </div> */}
          
    </>
  )
}

export default Home