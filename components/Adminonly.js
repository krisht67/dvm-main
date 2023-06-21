const Adminonly = (props) => {
  return (
    <div className="m-4 bg-blue-800 p-6 text-white  ">
      <center>
        <div>
          <h1>{props.page}</h1>
        </div>
        <p>Admin Access only</p>
      </center>
    </div>
  )
}

export default Adminonly
