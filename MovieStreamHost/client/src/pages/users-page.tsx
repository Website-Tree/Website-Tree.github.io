import { useState } from "react";
import { UserTable } from "@/components/users/user-table";
import { CreateUserForm } from "@/components/users/create-user-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";

export default function UsersPage() {
  const [createUserOpen, setCreateUserOpen] = useState(false);
  
  return (
    <div className="py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          
          <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#E50914] hover:bg-[#B81D24]">
                <UserPlus className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#141414] border-gray-800 max-w-md">
              <CreateUserForm />
            </DialogContent>
          </Dialog>
        </div>
        
        <UserTable />
      </div>
    </div>
  );
}
