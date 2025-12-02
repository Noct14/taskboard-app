
import { ColumnWithTasks } from "@/lib/supabase/models";
import React from 'react'
import { Badge } from "./ui/badge";

function Column ({ 
    column, 
    children, 
    onCreateTask, 
    onEditColumn, 
}: {
    column: ColumnWithTasks;
    children: React.ReactNode;
    onCreateTask: (taskData: any) => Promise<void>;
    onEditColumn: (column: ColumnWithTasks) => void;
}) {

    return (
        <div>
            <div>
                {/* Column Header */}
                <div>
                    <div>
                        <div>
                            <h3>{column.title}</h3>
                            <Badge>
                                {column.tasks.length}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Column