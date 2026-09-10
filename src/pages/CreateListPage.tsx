import { useState } from "react"

const CreateListPage = () => {
  const [listName, setListName] = useState('');

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!listName.trim()) {
      console.log("Please enter a valid name!");
      return;
    }


  }
  return (
    <div>
        {/* create list option */}
        <div>
          <p>Create a new list</p>
        <form action="" onSubmit={handleSubmit}>
          <input type="text" onChange={(e) => {
            setListName(e.target.value)
          }} name="" id="" value={listName} placeholder="Enter List Name"/>
          <button type="submit">Create List</button>
          </form>
        </div>
    </div>
  )
}

export default CreateListPage